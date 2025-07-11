import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { ForbiddenException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDeletionService } from '../services';
import { UserDto } from '../dto';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('class-transformer', () => ({
  plainToInstance: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Type: () => () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Exclude: () => () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Expose: () => () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Transform: () => () => {},
}));
const mockedPlainToInstance = plainToInstance as jest.MockedFunction<
  typeof plainToInstance
>;

jest.mock('../../../constants', () => ({
  SALT_ROUNDS: 10,
  TOKEN_CONFIG: {
    ACCESS_TOKEN: {
      JWT_EXPIRY: '15m',
      SECONDS: 900,
    },
    REFRESH_TOKEN: {
      JWT_EXPIRY: '7d',
      MILLISECONDS: 604800000,
    },
    TOKEN_LIMITS: {
      MAX_REFRESH_TOKENS_PER_USER: 5,
    },
  },
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-random-bytes'),
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrismaService: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockUserDeletionService: any;

  beforeEach(() => {
    mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'NX_PUBLIC_JWT_REFRESH_SECRET') return 'refresh-secret';
        if (key === 'NX_PUBLIC_JWT_SECRET') return 'jwt-secret';

        return undefined;
      }),
    };

    mockUserDeletionService = {
      softDeleteUser: jest.fn(),
      hardDeleteUser: jest.fn(),
    };

    mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);

    authService = new AuthService(
      mockJwtService as JwtService,
      mockConfigService as ConfigService,
      mockPrismaService as PrismaService,
      mockUserDeletionService as UserDeletionService
    );

    jest.clearAllMocks();
  });

  describe('create user', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'Test@Example.com',
        password: 'SecurePassword123!',
        name: 'Test User',
      };

      const mockCreatedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'CLIENT',
        original_email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        settings: null,
        is_active: true,
      };

      const expectedUserDto = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'CLIENT',
      } as UserDto;

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockedPlainToInstance.mockReturnValue(expectedUserDto);

      const result = await authService.createUser(userData);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('SecurePassword123!', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com', // Should be normalized to lowercase
          password: 'hashed_password',
          name: 'Test User',
          original_email: 'test@example.com',
        },
      });
      expect(mockedPlainToInstance).toHaveBeenCalledWith(
        UserDto,
        mockCreatedUser
      );
      expect(result).toEqual(expectedUserDto);
    });

    it('should handle user creation without name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const mockCreatedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: null,
        role: 'CLIENT',
        original_email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        settings: null,
        is_active: true,
      };

      const expectedUserDto = {
        id: 1,
        email: 'test@example.com',
        role: 'CLIENT',
      } as UserDto;

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockedPlainToInstance.mockReturnValue(expectedUserDto);

      const result = await authService.createUser(userData);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed_password',
          name: undefined,
          original_email: 'test@example.com',
        },
      });
      expect(result).toEqual(expectedUserDto);
    });
  });

  describe('update user', () => {
    it('should update user email successfully', async () => {
      const userId = 1;
      const updateData = { email: 'new.email@example.com' };

      const mockUpdatedUser = {
        id: userId,
        email: 'new.email@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'CLIENT',
        original_email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        settings: null,
        is_active: true,
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await authService.updateUser(userId, updateData);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should handle empty update data', async () => {
      const userId = 1;
      const updateData = {};

      const mockUpdatedUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'CLIENT',
        original_email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        settings: null,
        is_active: true,
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await authService.updateUser(userId, updateData);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw an error when user is not found', async () => {
      const userId = 999; // Non-existent user ID
      const updateData = { email: 'new.email@example.com' };

      const prismaError = new Error('User not found');
      mockPrismaService.user.update.mockRejectedValue(prismaError);

      await expect(
        authService.updateUser(userId, updateData)
      ).rejects.toThrow();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });
  });

  describe('soft delete user', () => {
    it('should call userDeletionService.softDeleteUser with correct parameters', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const expectedResult = {
        id: targetUserId,
        email: 'test@example.com',
        name: 'Test User',
        is_active: false,
      };

      mockUserDeletionService.softDeleteUser.mockResolvedValue(expectedResult);

      const result = await authService.softDeleteUser(
        targetUserId,
        accessToken
      );

      expect(mockUserDeletionService.softDeleteUser).toHaveBeenCalledWith(
        targetUserId,
        accessToken
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from userDeletionService', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const expectedError = new ForbiddenException('Insufficient permissions');

      mockUserDeletionService.softDeleteUser.mockRejectedValue(expectedError);

      await expect(
        authService.softDeleteUser(targetUserId, accessToken)
      ).rejects.toThrow(ForbiddenException);

      expect(mockUserDeletionService.softDeleteUser).toHaveBeenCalledWith(
        targetUserId,
        accessToken
      );
    });
  });

  describe('hard delete user', () => {
    it('should call userDeletionService.hardDeleteUser with correct parameters', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const expectedResult = { message: 'User hard deleted successfully' };

      mockUserDeletionService.hardDeleteUser.mockResolvedValue(expectedResult);

      const result = await authService.hardDeleteUser(
        targetUserId,
        accessToken
      );

      expect(mockUserDeletionService.hardDeleteUser).toHaveBeenCalledWith(
        targetUserId,
        accessToken
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from userDeletionService', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const expectedError = new ForbiddenException('Insufficient permissions');

      mockUserDeletionService.hardDeleteUser.mockRejectedValue(expectedError);

      await expect(
        authService.hardDeleteUser(targetUserId, accessToken)
      ).rejects.toThrow(ForbiddenException);

      expect(mockUserDeletionService.hardDeleteUser).toHaveBeenCalledWith(
        targetUserId,
        accessToken
      );
    });
  });

  describe('sign in', () => {
    const mockDeviceInfo = {
      ip: '127.0.0.1',
      userAgent: 'Test User Agent',
    };

    it('should authenticate a user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'CLIENT',
        original_email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        settings: null,
        is_active: true,
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      jest
        .spyOn(authService as any, 'generateTokenPair')
        .mockResolvedValue(mockTokens);

      const result = await authService.signIn(credentials, mockDeviceInfo);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'SecurePassword123!',
        'hashed_password'
      );
      expect((authService as any).generateTokenPair).toHaveBeenCalledWith(
        mockUser,
        mockDeviceInfo
      );
      expect(result).toEqual(mockTokens);
    });

    it('should normalize email to lowercase', async () => {
      const credentials = {
        email: 'Test@Example.com',
        password: 'SecurePassword123!',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'CLIENT',
        original_email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        settings: null,
        is_active: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jest.spyOn(authService as any, 'generateTokenPair').mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900,
      });

      await authService.signIn(credentials, mockDeviceInfo);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }, // Should be normalized to lowercase
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.signIn(credentials, mockDeviceInfo)
      ).rejects.toThrow('User not found');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'CLIENT',
        original_email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        settings: null,
        is_active: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        authService.signIn(credentials, mockDeviceInfo)
      ).rejects.toThrow('Invalid credentials');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'WrongPassword123!',
        'hashed_password'
      );
    });
  });
});
