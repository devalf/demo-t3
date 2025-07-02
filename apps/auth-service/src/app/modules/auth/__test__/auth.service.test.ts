import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDeletionService } from '../services';
import { UserDto } from '../dto';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('class-transformer', () => ({
  plainToInstance: jest.fn(),
  Type: () => () => {
    //
  },
  Exclude: () => () => {
    //
  },
  Expose: () => () => {
    //
  },
  Transform: () => () => {
    //
  },
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
});
