import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from 'nest-keycloak-connect';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    await this.usersService.createUser(username, password);
    return {
      message: 'Usuário criado com sucesso',
    };
  }
  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const tokenData = await this.usersService.signin(username, password);
    return {
      message: 'Login bem-sucedido',
      tokenData,
    };
  }
}
