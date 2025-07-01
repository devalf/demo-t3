import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDeletionService } from '../services';
import { UserDto } from '../dto';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let configServiceMock: jest.Mocked<ConfigService>;
  let prismaServiceMock: jest.Mocked<PrismaService>;
  let userDeletionServiceMock: jest.Mocked<UserDeletionService>;

  beforeEach(() => {
    jwtServiceMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    configServiceMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    prismaServiceMock = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    userDeletionServiceMock = {
      softDeleteUser: jest.fn(),
      hardDeleteUser: jest.fn(),
    } as unknown as jest.Mocked<UserDeletionService>;

    authService = new AuthService(
      jwtServiceMock,
      configServiceMock,
      prismaServiceMock,
      userDeletionServiceMock
    );

    authController = new AuthController(authService);
  });

  describe('register', () => {
    it('should respond with successful result on user creation', async () => {
      const inputData = {
        email: 'user2@example.com',
        password: 'SecurePassword123!',
        name: 'Test User',
      };

      const expectedResult: UserDto = {
        id: 1,
        email: 'user2@example.com',
        role: 'CLIENT',
        name: 'Test User',
        deleted_at: '',
        createdAt: '',
        updatedAt: '',
        password: '',
        settings: '',
        is_active: true,
        original_email: '',
      };

      const createUserSpy = jest
        .spyOn(authService, 'createUser')
        .mockImplementation((params) => {
          expect(params).toEqual(inputData);

          return Promise.resolve(expectedResult);
        });

      const result = await authController.register(inputData);

      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(createUserSpy).toHaveBeenCalledWith(inputData);
      expect(result).toBe(expectedResult);
    });

    it('should fail if controller does not pass correct parameters to service', async () => {
      const inputData = {
        email: 'user2@example.com',
        password: 'SecurePassword123!',
        name: 'Test User',
      };

      jest.spyOn(authService, 'createUser').mockImplementation((params) => {
        expect(params.email).toBe('different@email.com');

        return Promise.resolve({} as UserDto);
      });

      await expect(authController.register(inputData)).rejects.toThrow();
    });

    it('should handle service errors properly', async () => {
      const inputData = {
        email: 'user2@example.com',
        password: 'SecurePassword123!',
        name: 'Test User',
      };

      jest
        .spyOn(authService, 'createUser')
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(authController.register(inputData)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should validate that controller passes parameters unchanged', async () => {
      const inputData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'MyPassword123',
        name: 'John Doe',
      };

      let receivedParams: any;

      jest.spyOn(authService, 'createUser').mockImplementation((params) => {
        receivedParams = params;

        return Promise.resolve({
          id: 1,
          email: params.email,
          name: params.name,
          role: 'CLIENT',
        } as UserDto);
      });

      await authController.register(inputData);

      expect(receivedParams).toEqual(inputData);
      expect(receivedParams.email).toBe('TEST@EXAMPLE.COM');
      expect(receivedParams.password).toBe('MyPassword123');
      expect(receivedParams.name).toBe('John Doe');
    });

    it('should call service with invalid input when bypassing HTTP layer', async () => {
      const createUserSpy = jest
        .spyOn(authService, 'createUser')
        .mockResolvedValue({} as UserDto);

      await authController.register({
        email: 'invalid-email',
        password: '123',
        name: '',
      });

      expect(createUserSpy).toHaveBeenCalledWith({
        email: 'invalid-email',
        password: '123',
        name: '',
      });
    });
  });
});
