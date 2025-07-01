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

  describe('sign in', () => {
    it('should respond with successful result on user sign in', async () => {
      const inputData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        deviceInfo: {
          userAgent: 'Test Browser',
          ip: '192.168.1.1',
        },
      };

      const expectedResult = {
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token',
        expiresIn: 3600,
      };

      const mockRequest = {
        headers: {
          'user-agent': 'Test Browser',
        },
        ip: '192.168.1.1',
        connection: {},
      } as any;

      const signInSpy = jest
        .spyOn(authService, 'signIn')
        .mockImplementation((credentials, finalDeviceInfo) => {
          expect(credentials).toEqual({
            email: inputData.email,
            password: inputData.password,
          });
          expect(finalDeviceInfo).toEqual({
            userAgent: 'Test Browser',
            ip: '192.168.1.1',
          });

          return Promise.resolve(expectedResult);
        });

      const result = await authController.signIn(inputData, mockRequest);

      expect(signInSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedResult);
    });

    it('should fail if controller does not pass correct credentials to service', async () => {
      const inputData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        deviceInfo: {
          userAgent: 'Test Browser',
          ip: '192.168.1.1',
        },
      };

      const mockRequest = {
        headers: {
          'user-agent': 'Test Browser',
        },
        ip: '192.168.1.1',
      } as any;

      jest.spyOn(authService, 'signIn').mockImplementation((credentials) => {
        expect(credentials.email).toBe('different@email.com');

        return Promise.resolve({} as any);
      });

      await expect(
        authController.signIn(inputData, mockRequest)
      ).rejects.toThrow();
    });

    it('should handle service errors properly', async () => {
      const inputData = {
        email: 'user@example.com',
        password: 'WrongPassword',
        deviceInfo: {
          userAgent: 'Test Browser',
          ip: '192.168.1.1',
        },
      };

      const mockRequest = {
        headers: {
          'user-agent': 'Test Browser',
        },
        ip: '192.168.1.1',
      } as any;

      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authController.signIn(inputData, mockRequest)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should validate that controller passes credentials unchanged', async () => {
      const inputData = {
        email: 'USER@EXAMPLE.COM',
        password: 'MyPassword123',
        deviceInfo: {
          userAgent: 'Chrome Browser',
          ip: '10.0.0.1',
        },
      };

      const mockRequest = {
        headers: {
          'user-agent': 'Chrome Browser',
        },
        ip: '10.0.0.1',
        connection: {},
      } as any;

      let receivedCredentials: any;
      let receivedDeviceInfo: any;

      jest
        .spyOn(authService, 'signIn')
        .mockImplementation((credentials, deviceInfo) => {
          receivedCredentials = credentials;
          receivedDeviceInfo = deviceInfo;

          return Promise.resolve({
            accessToken: 'token',
            refreshToken: 'refresh',
            expiresIn: 3600,
          });
        });

      await authController.signIn(inputData, mockRequest);

      expect(receivedCredentials).toEqual({
        email: 'USER@EXAMPLE.COM',
        password: 'MyPassword123',
      });
      expect(receivedDeviceInfo).toEqual({
        userAgent: 'Chrome Browser',
        ip: '10.0.0.1',
      });
    });

    it('should handle NotFoundException from service', async () => {
      const inputData = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123!',
        deviceInfo: {
          userAgent: 'Test Browser',
          ip: '192.168.1.1',
        },
      };

      const mockRequest = {
        headers: {
          'user-agent': 'Test Browser',
        },
        ip: '192.168.1.1',
      } as any;

      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new Error('User not found'));

      await expect(
        authController.signIn(inputData, mockRequest)
      ).rejects.toThrow('User not found');
    });

    it('should handle UnauthorizedException from service', async () => {
      const inputData = {
        email: 'user@example.com',
        password: 'WrongPassword',
        deviceInfo: {
          userAgent: 'Test Browser',
          ip: '192.168.1.1',
        },
      };

      const mockRequest = {
        headers: {
          'user-agent': 'Test Browser',
        },
        ip: '192.168.1.1',
      } as any;

      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authController.signIn(inputData, mockRequest)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should call service with invalid input when bypassing HTTP layer', async () => {
      const signInSpy = jest.spyOn(authService, 'signIn').mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const mockRequest = {
        headers: {},
        connection: {},
      } as any;

      await authController.signIn(
        {
          email: 'invalid-email',
          password: '123',
          deviceInfo: { userAgent: 'test', ip: 'invalid-ip' },
        },
        mockRequest
      );

      expect(signInSpy).toHaveBeenCalledWith(
        {
          email: 'invalid-email',
          password: '123',
        },
        {
          userAgent: 'test',
          ip: 'invalid-ip',
        }
      );
    });

    it('should fall back to request headers when deviceInfo not provided', async () => {
      const inputData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
      };

      const expectedResult = {
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token',
        expiresIn: 3600,
      };

      const mockRequest = {
        headers: {
          'user-agent': 'Mozilla/5.0 Browser',
          'x-forwarded-for': '203.0.113.1, 192.168.1.1',
        },
        ip: '10.0.0.1',
        connection: {},
      } as any;

      const signInSpy = jest
        .spyOn(authService, 'signIn')
        .mockImplementation((credentials, finalDeviceInfo) => {
          expect(credentials).toEqual({
            email: inputData.email,
            password: inputData.password,
          });
          expect(finalDeviceInfo).toEqual({
            userAgent: 'Mozilla/5.0 Browser',
            ip: '10.0.0.1',
          });

          return Promise.resolve(expectedResult);
        });

      const result = await authController.signIn(inputData, mockRequest);

      expect(signInSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedResult);
    });

    it('should use Unknown fallbacks when no device info available', async () => {
      const inputData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
      };

      const expectedResult = {
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token',
        expiresIn: 3600,
      };

      const mockRequest = {
        headers: {},
        connection: {},
      } as any;

      const signInSpy = jest
        .spyOn(authService, 'signIn')
        .mockImplementation((credentials, finalDeviceInfo) => {
          expect(finalDeviceInfo).toEqual({
            userAgent: 'Unknown',
            ip: 'Unknown',
          });

          return Promise.resolve(expectedResult);
        });

      await authController.signIn(inputData, mockRequest);

      expect(signInSpy).toHaveBeenCalledTimes(1);
    });
  });
});
