import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from '../url.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from '../url.entity/url.entity';
import { Click } from '../../clicks/entities/click.entity/click.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateUrlDto } from '../dto/create-url.dto';
import { Request } from 'express';
import { MockProxy, mock } from 'jest-mock-extended';

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: MockProxy<Repository<Url>>;
  let clickRepository: MockProxy<Repository<Click>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(Url),
          useValue: mock<Repository<Url>>(),
        },
        {
          provide: getRepositoryToken(Click),
          useValue: mock<Repository<Click>>(),
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlRepository = module.get(getRepositoryToken(Url));
    clickRepository = module.get(getRepositoryToken(Click));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new URL successfully', async () => {
      const createUrlDto: CreateUrlDto = {
        original_url: 'https://example.com',
      };
      const userId = 'user123';
      const shortCode = 'abc123';
      const savedUrl: Url = {
        id: 'url123',
        original_url: createUrlDto.original_url,
        short_code: shortCode,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      jest
        .spyOn(service as any, 'generateShortCode')
        .mockResolvedValue(shortCode);

      urlRepository.create.mockReturnValue(savedUrl);
      urlRepository.save.mockResolvedValue(savedUrl);

      const result = await service.create(createUrlDto, userId);

      expect(service['generateShortCode']).toHaveBeenCalled();
      expect(urlRepository.create).toHaveBeenCalledWith({
        ...createUrlDto,
        short_code: shortCode,
        user_id: userId,
      });
      expect(urlRepository.save).toHaveBeenCalledWith(savedUrl);
      expect(result).toEqual(savedUrl);
    });
  });

  describe('registerClick', () => {
    it('should register a click successfully', async () => {
      const urlId = 'url123';
      const req = {
        headers: { 'user-agent': 'Mozilla/5.0' },
        ip: '127.0.0.1',
      } as Request;

      const click: Click = {
        id: 'click123',
        url_id: urlId,
        user_agent: req.headers['user-agent'],
        ip_address: req.ip,
        clicked_at: new Date(),
      };

      clickRepository.create.mockReturnValue(click);
      clickRepository.save.mockResolvedValue(click);

      await service.registerClick(urlId, req);

      expect(clickRepository.create).toHaveBeenCalledWith({
        url_id: urlId,
        user_agent: req.headers['user-agent'],
        ip_address: req.ip,
      });
      expect(clickRepository.save).toHaveBeenCalledWith(click);
    });
  });

  describe('findByShortCode', () => {
    it('should return a URL when found', async () => {
      const shortCode = 'abc123';
      const url: Url = {
        id: 'url123',
        original_url: 'https://example.com',
        short_code: shortCode,
        user_id: 'user123',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      urlRepository.findOne.mockResolvedValue(url);

      const result = await service.findByShortCode(shortCode);

      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { short_code: shortCode, deleted_at: null },
      });
      expect(result).toEqual(url);
    });

    it('should return null when URL is not found', async () => {
      const shortCode = 'invalidCode';

      urlRepository.findOne.mockResolvedValue(null);

      const result = await service.findByShortCode(shortCode);

      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { short_code: shortCode, deleted_at: null },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByUserWithClickCount', () => {
    it('should return URLs with click counts for a user', async () => {
      const userId = 'user123';
      const urls: Url[] = [
        {
          id: 'url1',
          original_url: 'https://example1.com',
          short_code: 'code1',
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        {
          id: 'url2',
          original_url: 'https://example2.com',
          short_code: 'code2',
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      ];

      urlRepository.find.mockResolvedValue(urls);

      clickRepository.count.mockResolvedValueOnce(5).mockResolvedValueOnce(3);

      const result = await service.findByUserWithClickCount(userId);

      expect(urlRepository.find).toHaveBeenCalledWith({
        where: { user_id: userId, deleted_at: null },
        order: { created_at: 'DESC' },
      });
      expect(clickRepository.count).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { ...urls[0], click_count: 5 },
        { ...urls[1], click_count: 3 },
      ]);
    });
  });

  describe('update', () => {
    it('should update the URL successfully', async () => {
      const id = 'url123';
      const original_url = 'https://updated.com';
      const userId = 'user123';

      const url: Url = {
        id,
        original_url: 'https://example.com',
        short_code: 'abc123',
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      const updatedUrl: Url = {
        ...url,
        original_url,
        updated_at: expect.any(Date), // Usar expect.any(Date)
      };

      urlRepository.findOne.mockResolvedValue(url);
      urlRepository.save.mockResolvedValue({
        ...updatedUrl,
        updated_at: new Date(),
      });

      const result = await service.update(id, original_url, userId);

      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id, user_id: userId, deleted_at: null },
      });

      expect(urlRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...url,
          original_url,
          updated_at: expect.any(Date),
        }),
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...updatedUrl,
          updated_at: expect.any(Date),
        }),
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete the URL successfully', async () => {
      const id = 'url123';
      const userId = 'user123';

      const url: Url = {
        id,
        original_url: 'https://example.com',
        short_code: 'abc123',
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      urlRepository.findOne.mockResolvedValue(url);
      urlRepository.save.mockResolvedValue({
        ...url,
        deleted_at: new Date(),
      });

      await service.softDelete(id, userId);

      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id, user_id: userId, deleted_at: null },
      });
      expect(urlRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...url,
          deleted_at: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException if URL is not found', async () => {
      const id = 'invalidId';
      const userId = 'user123';

      urlRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete(id, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id, user_id: userId, deleted_at: null },
      });
      expect(urlRepository.save).not.toHaveBeenCalled();
    });
  });
});
