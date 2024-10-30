import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from '../url.controller';
import { UrlService } from '../url.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { NotFoundException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('UrlController', () => {
  let controller: UrlController;
  let urlService: UrlService;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockUrlService = {
      create: jest.fn(),
      findByShortCode: jest.fn(),
      registerClick: jest.fn(),
      findByUserWithClickCount: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a short URL successfully', async () => {
      const createUrlDto = { original_url: 'https://example.com' };
      const req = {
        headers: {
          authorization: 'Bearer mocktoken',
        },
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as unknown as Request;

      const userId = 'user123';

      const urlResult = {
        id: 'url123',
        original_url: createUrlDto.original_url,
        short_code: 'abc123',
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      const baseUrl = 'http://localhost:3000';

      jest.spyOn(jwt, 'decode').mockReturnValue({ sub: userId });
      jest.spyOn(urlService, 'create').mockResolvedValue(urlResult);
      jest.spyOn(configService, 'get').mockReturnValue(baseUrl);

      const result = await controller.create(createUrlDto, req);

      expect(jwt.decode).toHaveBeenCalledWith('mocktoken');
      expect(urlService.create).toHaveBeenCalledWith(createUrlDto, userId);
      expect(result).toEqual({
        short_url: `${baseUrl}/urls/${urlResult.short_code}`,
      });
    });

    it('should create a short URL without userId if no token is provided', async () => {
      const createUrlDto = { original_url: 'https://example.com' };
      const req = {
        headers: {},
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as unknown as Request;

      const urlResult = {
        id: 'url123',
        original_url: createUrlDto.original_url,
        short_code: 'abc123',
        user_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      const baseUrl = 'http://localhost:3000';

      jest.spyOn(jwt, 'decode').mockReturnValue(null);
      jest.spyOn(urlService, 'create').mockResolvedValue(urlResult);
      jest.spyOn(configService, 'get').mockReturnValue(baseUrl);

      const result = await controller.create(createUrlDto, req);

      expect(jwt.decode).not.toHaveBeenCalled();
      expect(urlService.create).toHaveBeenCalledWith(createUrlDto, null);
      expect(result).toEqual({
        short_url: `${baseUrl}/urls/${urlResult.short_code}`,
      });
    });
  });

  describe('redirect', () => {
    it('should redirect to the original URL', async () => {
      const shortCode = 'abc123';
      const req = {} as Request;
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      const url = {
        id: 'url123',
        original_url: 'https://example.com',
        short_code: shortCode,
        user_id: 'user123',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      jest.spyOn(urlService, 'findByShortCode').mockResolvedValue(url);
      jest.spyOn(urlService, 'registerClick').mockResolvedValue(undefined);

      await controller.redirect(shortCode, res, req);

      expect(urlService.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(urlService.registerClick).toHaveBeenCalledWith(url.id, req);
      expect(res.redirect).toHaveBeenCalledWith(url.original_url);
    });

    it('should throw NotFoundException if URL is not found', async () => {
      const shortCode = 'invalidCode';
      const req = {} as Request;
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      jest.spyOn(urlService, 'findByShortCode').mockResolvedValue(null);

      await expect(controller.redirect(shortCode, res, req)).rejects.toThrow(
        NotFoundException,
      );

      expect(urlService.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all URLs for the authenticated user', async () => {
      const user = { sub: 'user123' };
      const urls = [
        {
          id: 'url1',
          original_url: 'https://example1.com',
          short_code: 'code1',
          user_id: user.sub,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          click_count: 5,
        },
        {
          id: 'url2',
          original_url: 'https://example2.com',
          short_code: 'code2',
          user_id: user.sub,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          click_count: 3,
        },
      ];

      jest
        .spyOn(urlService, 'findByUserWithClickCount')
        .mockResolvedValue(urls);

      const result = await controller.findAll(user);

      expect(urlService.findByUserWithClickCount).toHaveBeenCalledWith(
        user.sub,
      );
      expect(result).toEqual(urls);
    });
  });

  describe('update', () => {
    it('should update the URL successfully', async () => {
      const id = 'url123';
      const original_url = 'https://updated.com';
      const user = { sub: 'user123' };
      const updatedUrl = {
        id,
        original_url,
        short_code: 'abc123',
        user_id: user.sub,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      jest.spyOn(urlService, 'update').mockResolvedValue(updatedUrl);

      const result = await controller.update(id, original_url, user);

      expect(urlService.update).toHaveBeenCalledWith(
        id,
        original_url,
        user.sub,
      );
      expect(result).toEqual(updatedUrl);
    });
  });

  describe('remove', () => {
    it('should remove the URL successfully', async () => {
      const id = 'url123';
      const user = { sub: 'user123' };

      jest.spyOn(urlService, 'softDelete').mockResolvedValue(undefined);

      const result = await controller.remove(id, user);

      expect(urlService.softDelete).toHaveBeenCalledWith(id, user.sub);
      expect(result).toEqual({
        message: 'URL deleted successfully',
      });
    });
  });
});
