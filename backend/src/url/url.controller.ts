import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  Put,
  Delete,
  NotFoundException,
  Req,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { AuthenticatedUser, Public } from 'nest-keycloak-connect';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('URLs')
@Controller('urls')
export class UrlController {
  constructor(
    private readonly urlsService: UrlService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Cria uma nova URL encurtada' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'URL criada com sucesso.',
    schema: {
      example: {
        short_url: 'http://localhost:3000/urls/abc123',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetros inválidos.',
  })
  async create(@Body() createUrlDto: CreateUrlDto, @Req() req: Request) {
    let userId: string | null = null;
    const authHeader = req.headers['authorization'];

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.decode(token) as { sub?: string };
          userId = decoded?.sub || null;
        } catch (error) {
          console.error('Erro ao decodificar o token:', error);
        }
      }
    }

    const url = await this.urlsService.create(createUrlDto, userId);

    const baseUrl =
      this.configService.get<string>('BASE_URL') ||
      `${req.protocol}://${req.get('host')}`;

    return {
      short_url: `${baseUrl}/urls/${url.short_code}`,
    };
  }

  @Public()
  @Get(':shortCode')
  @ApiOperation({ summary: 'Redireciona para a URL original' })
  @ApiParam({
    name: 'shortCode',
    description: 'Código curto da URL',
    type: String,
    example: 'abc123',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirecionamento bem-sucedido.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'URL não encontrada.',
  })
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const url = await this.urlsService.findByShortCode(shortCode);

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    await this.urlsService.registerClick(url.id, req);

    return res.redirect(url.original_url);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todas as URLs do usuário autenticado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de URLs retornada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async findAll(@AuthenticatedUser() user: any) {
    const userId = user.sub;
    const urls = await this.urlsService.findByUserWithClickCount(userId);
    return urls;
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza uma URL encurtada' })
  @ApiParam({
    name: 'id',
    description: 'Identificador único da URL',
    type: String,
    example: 'url123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'URL atualizada com sucesso.',
    schema: {
      example: {
        id: 'url123',
        original_url: 'https://updated.com',
        short_code: 'abc123',
        user_id: 'user123',
        created_at: '2024-10-30T03:48:14.447Z',
        updated_at: '2024-10-30T03:50:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'URL não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async update(
    @Param('id') id: string,
    @Body('original_url') original_url: string,
    @AuthenticatedUser() user: any,
  ) {
    const userId = user.sub;
    const url = await this.urlsService.update(id, original_url, userId);
    return url;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove uma URL encurtada' })
  @ApiParam({
    name: 'id',
    description: 'Identificador único da URL',
    type: String,
    example: 'url123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'URL removida com sucesso.',
    schema: {
      example: {
        message: 'URL deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'URL não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Não autorizado.',
  })
  async remove(@Param('id') id: string, @AuthenticatedUser() user: any) {
    const userId = user.sub;
    await this.urlsService.softDelete(id, userId);
    return {
      message: 'URL deleted successfully',
    };
  }
}
