import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const mockUsersService = {
      createUser: jest.fn(),
      signin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user and return a success message', async () => {
      const username = 'testuser';
      const password = 'testpassword';

      jest.spyOn(usersService, 'createUser').mockResolvedValue(undefined);

      const result = await controller.signup(username, password);

      expect(usersService.createUser).toHaveBeenCalledWith(username, password);
      expect(result).toEqual({
        message: 'Usuário criado com sucesso',
      });
    });

    it('should throw an error if createUser fails', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const errorMessage = 'Error creating user';

      jest
        .spyOn(usersService, 'createUser')
        .mockRejectedValue(new Error(errorMessage));

      await expect(controller.signup(username, password)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('signin', () => {
    it('should authenticate a user and return a token', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const tokenData = {
        accessToken: 'some-jwt-token',
        expiresIn: 3600,
      };

      jest.spyOn(usersService, 'signin').mockResolvedValue(tokenData);

      const result = await controller.signin(username, password);

      expect(usersService.signin).toHaveBeenCalledWith(username, password);
      expect(result).toEqual({
        message: 'Login bem-sucedido',
        tokenData,
      });
    });

    it('should throw an error if signin fails', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const errorMessage = 'Invalid credentials';

      jest
        .spyOn(usersService, 'signin')
        .mockRejectedValue(new Error(errorMessage));

      await expect(controller.signin(username, password)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
