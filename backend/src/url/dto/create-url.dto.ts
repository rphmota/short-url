import { IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'URL original que será encurtada',
    example: 'https://exemplo.com/artigo',
  })
  @IsUrl()
  @IsNotEmpty()
  original_url: string;
}
