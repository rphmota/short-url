import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Click } from './entities/click.entity/click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Click])],
  exports: [TypeOrmModule],
})
export class ClicksModule {}
