import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UsersService {
  private async getAdminToken(): Promise<string> {
    const tokenUrl = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return response.data.access_token;
  }

  async createUser(username: string, password: string): Promise<any> {
    try {
      const token = await this.getAdminToken();

      const existingUserResponse = await axios.get(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          params: { username },
        },
      );

      if (existingUserResponse.data.length > 0) {
        throw new ConflictException('Usuário já existe');
      }

      const userResponse = await axios.post(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
        {
          username,
          enabled: true,
          credentials: [
            {
              type: 'password',
              value: password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return userResponse.data;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error(
        'Error creating user:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
  async signin(username: string, password: string): Promise<any> {
    try {
      const tokenUrl = `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'password',
          client_id: process.env.KEYCLOAK_CLIENT_ID,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
          username,
          password,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error signing in:', error.response?.data || error.message);
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }
}
