import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './url.entity/url.entity';
import { Repository } from 'typeorm';
import { CreateUrlDto } from './dto/create-url.dto';
import { customAlphabet } from 'nanoid';
import { Click } from '../clicks/entities/click.entity/click.entity';
import { Request } from 'express';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
    @InjectRepository(Click)
    private clicksRepository: Repository<Click>,
  ) {}

  private async generateShortCode(): Promise<string> {
    const nanoid = customAlphabet(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      6,
    );
    let shortCode;
    let exists = true;
    do {
      shortCode = await nanoid();
      const url = await this.urlsRepository.findOne({
        where: { short_code: shortCode },
      });
      if (!url) {
        exists = false;
      }
    } while (exists);
    return shortCode;
  }

  async create(createUrlDto: CreateUrlDto, userId?: string): Promise<Url> {
    const shortCode = await this.generateShortCode();

    const url = this.urlsRepository.create({
      ...createUrlDto,
      short_code: shortCode,
      user_id: userId,
    });

    return this.urlsRepository.save(url);
  }

  async registerClick(urlId: string, req: Request): Promise<void> {
    const click = this.clicksRepository.create({
      url_id: urlId,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip,
    });
    await this.clicksRepository.save(click);
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    return this.urlsRepository.findOne({
      where: { short_code: shortCode, deleted_at: null },
    });
  }

  async findByUserWithClickCount(userId: string): Promise<any[]> {
    const urls = await this.urlsRepository.find({
      where: { user_id: userId, deleted_at: null },
      order: { created_at: 'DESC' },
    });

    const result = await Promise.all(
      urls.map(async (url) => {
        const clickCount = await this.clicksRepository.count({
          where: { url_id: url.id },
        });
        return { ...url, click_count: clickCount };
      }),
    );

    return result;
  }

  async update(id: string, original_url: string, userId: string): Promise<Url> {
    const url = await this.urlsRepository.findOne({
      where: { id, user_id: userId, deleted_at: null },
    });

    if (!url) {
      throw new NotFoundException('URL not found or not owned by user');
    }

    url.original_url = original_url;
    url.updated_at = new Date();
    return this.urlsRepository.save(url);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const url = await this.urlsRepository.findOne({
      where: { id, user_id: userId, deleted_at: null },
    });

    if (!url) {
      throw new NotFoundException('URL not found or not owned by user');
    }

    url.deleted_at = new Date();
    await this.urlsRepository.save(url);
  }
}
