import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

describe('UsersService', () => {
  let service: UsersService;
  let mockedAxios: jest.Mocked<typeof axios>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockedAxios = axios as jest.Mocked<typeof axios>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const username = 'testuser';
      const password = 'testpassword';

      process.env.KEYCLOAK_AUTH_SERVER_URL = 'http://keycloak-server';
      process.env.KEYCLOAK_REALM = 'myrealm';
      process.env.KEYCLOAK_CLIENT_ID = 'myclient';
      process.env.KEYCLOAK_CLIENT_SECRET = 'mysecret';

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'admin-token' },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: [],
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { id: 'new-user-id' },
      });

      const result = await service.createUser(username, password);

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 'new-user-id' });
    });

    it('should throw ConflictException if user already exists', async () => {
      const username = 'existinguser';
      const password = 'testpassword';

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'admin-token' },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: [{ id: 'existing-user-id' }],
      });

      await expect(service.createUser(username, password)).rejects.toThrow(
        ConflictException,
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should rethrow error if user creation fails', async () => {
      const username = 'newuser';
      const password = 'testpassword';

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'admin-token' },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: [],
      });

      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(service.createUser(username, password)).rejects.toThrow(
        'Network Error',
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('signin', () => {
    it('should sign in a user successfully', async () => {
      const username = 'testuser';
      const password = 'testpassword';

      process.env.KEYCLOAK_AUTH_SERVER_URL = 'http://keycloak-server';
      process.env.KEYCLOAK_REALM = 'myrealm';
      process.env.KEYCLOAK_CLIENT_ID = 'myclient';
      process.env.KEYCLOAK_CLIENT_SECRET = 'mysecret';

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'user-token',
          refresh_token: 'refresh-token',
          expires_in: 3600,
        },
      });

      const result = await service.signin(username, password);

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        access_token: 'user-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const username = 'invaliduser';
      const password = 'wrongpassword';

      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: 'Invalid credentials',
        },
      });

      await expect(service.signin(username, password)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });
});
