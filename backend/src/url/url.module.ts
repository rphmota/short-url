import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { Url } from './url.entity/url.entity';
import { Click } from '../clicks/entities/click.entity/click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url, Click])],
  providers: [UrlService],
  controllers: [UrlController],
})
export class UrlModule {}
