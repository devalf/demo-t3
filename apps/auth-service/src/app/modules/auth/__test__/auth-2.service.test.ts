import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import {
  generateApiJwtPayload,
  generateApiRefreshTokenPayload,
  generateOrmUser,
} from '@demo-t3/utils';
import { ErrorCode } from '@demo-t3/models';

import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserOperationPermissionService } from '../services';
import { JwtUserUtil } from '../../../common/utils';

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

describe('AuthService part 2', () => {
  let authService: AuthService;
  let mockPrismaService: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockUserDeletionService: any;
  let mockUserOperationPermissionService: any;
  let mockJwtUserUtil: any;

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

    mockUserOperationPermissionService = {
      canDeleteUser: jest.fn().mockResolvedValue(true),
    };

    mockJwtUserUtil = {
      extractUserFromJwt: jest.fn(),
    };

    const mockEmailVerificationTokenService = {
      createToken: jest.fn(),
      verifyToken: jest.fn(),
      deleteToken: jest.fn(),
    };

    mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);

    authService = new AuthService(
      mockJwtService as JwtService,
      mockConfigService as ConfigService,
      mockPrismaService as PrismaService,
      mockUserOperationPermissionService as UserOperationPermissionService,
      mockJwtUserUtil as JwtUserUtil,
      mockEmailVerificationTokenService as any
    );

    jest.clearAllMocks();
  });

  describe('refreshToken', () => {
    const mockDeviceInfo = {
      ip: '127.0.0.1',
      userAgent: 'Test User Agent',
    };
    const mockRefreshToken = 'valid-refresh-token';

    it('should refresh tokens successfully', async () => {
      const mockPayload = generateApiRefreshTokenPayload();

      const mockUser = generateOrmUser();

      const mockStoredToken = {
        id: 'mock-token-id',
        user_id: 1,
        token: 'hashed-token',
        user_agent: 'Previous User Agent',
        ip_address: '192.168.1.1',
        expires_at: new Date(Date.now() + 3600000), // Not expired
        last_used_at: new Date(),
        user: mockUser,
      };

      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      };

      jest
        .spyOn(authService as any, 'verifyRefreshToken')
        .mockResolvedValue(mockPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(
        mockStoredToken
      );
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jest
        .spyOn(authService as any, 'updateTokenUsage')
        .mockResolvedValue(undefined);
      jest
        .spyOn(authService as any, 'rotateTokens')
        .mockResolvedValue(mockNewTokens);

      const result = await authService.refreshToken(
        mockRefreshToken,
        mockDeviceInfo
      );

      expect(authService['verifyRefreshToken']).toHaveBeenCalledWith(
        mockRefreshToken
      );
      expect(mockPrismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.tokenId },
        include: { user: true },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockRefreshToken,
        mockStoredToken.token
      );
      expect(authService['updateTokenUsage']).toHaveBeenCalledWith(
        mockPayload.tokenId,
        mockDeviceInfo
      );
      expect(authService['rotateTokens']).toHaveBeenCalledWith(
        mockUser,
        mockPayload.tokenId,
        mockDeviceInfo
      );
      expect(result).toEqual(mockNewTokens);
    });

    it('should throw when refresh token is not found', async () => {
      const mockPayload = generateApiRefreshTokenPayload();

      jest
        .spyOn(authService as any, 'verifyRefreshToken')
        .mockResolvedValue(mockPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
    });

    it('should throw and cleanup when refresh token is expired', async () => {
      const mockPayload = generateApiRefreshTokenPayload();

      const mockStoredToken = {
        id: 'mock-token-id',
        user_id: 1,
        token: 'hashed-token',
        user_agent: 'Previous User Agent',
        ip_address: '192.168.1.1',
        expires_at: new Date(Date.now() - 1000), // Expired
        last_used_at: new Date(),
        user: { id: 1 },
      };

      jest
        .spyOn(authService as any, 'verifyRefreshToken')
        .mockResolvedValue(mockPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(
        mockStoredToken
      );
      jest
        .spyOn(authService as any, 'cleanupToken')
        .mockResolvedValue(undefined);

      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(ErrorCode.TOKEN_EXPIRED);

      expect(authService['cleanupToken']).toHaveBeenCalledWith(
        mockPayload.tokenId
      );
    });

    it('should revoke all tokens when token is invalid (potential theft)', async () => {
      const mockPayload = generateApiRefreshTokenPayload();

      const mockStoredToken = {
        id: 'mock-token-id',
        user_id: 1,
        token: 'hashed-token',
        user_agent: 'Previous User Agent',
        ip_address: '192.168.1.1',
        expires_at: new Date(Date.now() + 3600000), // Not expired
        last_used_at: new Date(),
        user: { id: 1 },
      };

      jest
        .spyOn(authService as any, 'verifyRefreshToken')
        .mockResolvedValue(mockPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(
        mockStoredToken
      );
      mockedBcrypt.compare.mockResolvedValue(false as never);
      jest
        .spyOn(authService as any, 'revokeAllRefreshTokens')
        .mockResolvedValue(1);

      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(ErrorCode.REFRESH_TOKEN_INVALID);

      expect(authService['revokeAllRefreshTokens']).toHaveBeenCalledWith(
        mockStoredToken.user_id
      );
    });

    it('should throw ForbiddenException when user no longer exists', async () => {
      const mockPayload = generateApiRefreshTokenPayload();

      const mockStoredToken = {
        id: 'mock-token-id',
        user_id: 1,
        token: 'hashed-token',
        user_agent: 'Previous User Agent',
        ip_address: '192.168.1.1',
        expires_at: new Date(Date.now() + 3600000), // Not expired
        last_used_at: new Date(),
        user: null,
      };

      jest
        .spyOn(authService as any, 'verifyRefreshToken')
        .mockResolvedValue(mockPayload);
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(
        mockStoredToken
      );
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(ErrorCode.USER_NO_LONGER_EXISTS);
    });

    it('should handle JsonWebTokenError', async () => {
      jest.spyOn(authService as any, 'verifyRefreshToken').mockRejectedValue({
        name: 'JsonWebTokenError',
        message: 'Invalid token',
      });

      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(ErrorCode.REFRESH_TOKEN_INVALID);
    });

    it('should handle TokenExpiredError specifically', async () => {
      jest.spyOn(authService as any, 'verifyRefreshToken').mockRejectedValue({
        name: 'TokenExpiredError',
        message: 'jwt expired',
      });

      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow(ErrorCode.REFRESH_TOKEN_INVALID);
    });

    it('should propagate non-JWT errors', async () => {
      const customError = new Error('Database connection failed');
      jest
        .spyOn(authService as any, 'verifyRefreshToken')
        .mockRejectedValue(customError);

      await expect(
        authService.refreshToken(mockRefreshToken, mockDeviceInfo)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('revokeRefreshToken', () => {
    const mockRefreshToken = 'valid-refresh-token';

    it('should revoke a refresh token successfully', async () => {
      const mockPayload = generateApiRefreshTokenPayload();

      jest
        .spyOn(authService as any, 'verifyRefreshToken')
        .mockResolvedValue(mockPayload);
      jest
        .spyOn(authService as any, 'cleanupToken')
        .mockResolvedValue(undefined);

      await authService.revokeRefreshToken(mockRefreshToken);

      expect(authService['verifyRefreshToken']).toHaveBeenCalledWith(
        mockRefreshToken
      );
      expect(authService['cleanupToken']).toHaveBeenCalledWith(
        mockPayload.tokenId
      );
    });

    it('should handle JsonWebTokenError', async () => {
      jest.spyOn(authService as any, 'verifyRefreshToken').mockRejectedValue({
        name: 'JsonWebTokenError',
        message: 'Invalid token',
      });

      await expect(
        authService.revokeRefreshToken(mockRefreshToken)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.revokeRefreshToken(mockRefreshToken)
      ).rejects.toThrow(ErrorCode.REFRESH_TOKEN_INVALID);
    });

    it('should handle TokenExpiredError', async () => {
      jest.spyOn(authService as any, 'verifyRefreshToken').mockRejectedValue({
        name: 'TokenExpiredError',
        message: 'jwt expired',
      });

      await expect(
        authService.revokeRefreshToken(mockRefreshToken)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.revokeRefreshToken(mockRefreshToken)
      ).rejects.toThrow(ErrorCode.REFRESH_TOKEN_INVALID);
    });

    it('should handle UnauthorizedException', async () => {
      jest.spyOn(authService as any, 'verifyRefreshToken').mockRejectedValue({
        name: 'UnauthorizedException',
        message: 'Token validation failed',
      });

      await expect(
        authService.revokeRefreshToken(mockRefreshToken)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.revokeRefreshToken(mockRefreshToken)
      ).rejects.toThrow(ErrorCode.REFRESH_TOKEN_INVALID);
    });
  });

  describe('revokeAllRefreshTokens', () => {
    it('should revoke all refresh tokens for a user', async () => {
      const userId = 1;
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

      const result = await authService.revokeAllRefreshTokens(userId);

      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(result).toBe(3);
    });

    it('should handle errors when revoking tokens', async () => {
      const userId = 1;
      const dbError = new Error('Database error');

      mockPrismaService.refreshToken.deleteMany.mockRejectedValue(dbError);

      await expect(authService.revokeAllRefreshTokens(userId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = 'valid-token';
      const mockPayload = generateApiJwtPayload();

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });

      const result = await authService.verifyToken(token);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.id },
      });
      expect(result).toEqual({
        isValid: true,
        payload: mockPayload,
      });
    });

    it('should return error object when user no longer exists', async () => {
      const token = 'valid-token';
      const mockPayload = generateApiJwtPayload();

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await authService.verifyToken(token);

      expect(result).toEqual({
        isValid: false,
        error: ErrorCode.USER_NO_LONGER_EXISTS,
      });
    });

    it('should return invalid for JWT verification errors', async () => {
      const token = 'invalid-token';

      mockJwtService.verifyAsync.mockRejectedValue({
        message: 'Invalid token',
      });

      const result = await authService.verifyToken(token);

      expect(result).toEqual({
        isValid: false,
        error: 'Invalid token',
      });
    });

    it('should return invalid for database errors', async () => {
      const token = 'valid-token';
      const mockPayload = generateApiJwtPayload();

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('DB connection failed')
      );

      const result = await authService.verifyToken(token);

      expect(result).toEqual({
        isValid: false,
        error: 'DB connection failed',
      });
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should cleanup expired tokens', async () => {
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      const result = await authService.cleanupExpiredTokens();

      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expires_at: {
            lt: expect.any(Date),
          },
        },
      });
      expect(result).toBe(5);
    });

    it('should handle errors when cleaning up tokens', async () => {
      mockPrismaService.refreshToken.deleteMany.mockRejectedValue(
        new Error('Database error')
      );

      await expect(authService.cleanupExpiredTokens()).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('generateTokenPair', () => {
    const mockDeviceInfo = {
      ip: '127.0.0.1',
      userAgent: 'Test User Agent',
    };

    it('should generate a token pair successfully', async () => {
      const mockPayload = generateApiJwtPayload();

      mockJwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      jest
        .spyOn(authService as any, 'cleanupExistingDeviceToken')
        .mockResolvedValue(undefined);
      jest
        .spyOn(authService as any, 'enforceTokenLimit')
        .mockResolvedValue(undefined);
      jest
        .spyOn(authService as any, 'getRefreshTokenSecret')
        .mockReturnValue('refresh-secret');

      const result = await (authService as any).generateTokenPair(
        mockPayload,
        mockDeviceInfo
      );

      expect(authService['cleanupExistingDeviceToken']).toHaveBeenCalledWith(
        mockPayload.id,
        mockDeviceInfo
      );
      expect(authService['enforceTokenLimit']).toHaveBeenCalledWith(
        mockPayload.id
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          id: mockPayload.id,
          email: mockPayload.email,
          role: mockPayload.role,
        },
        {
          expiresIn: '15m',
        }
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          userId: mockPayload.id,
          tokenId: 'mock-random-bytes',
          type: 'refresh',
        },
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        }
      );

      expect(mockPrismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          id: 'mock-random-bytes',
          user_id: mockPayload.id,
          token: 'hashed_password',
          user_agent: mockDeviceInfo.userAgent,
          ip_address: mockDeviceInfo.ip,
          expires_at: expect.any(Date),
        },
      });

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900,
      });
    });
  });

  describe('rotateTokens', () => {
    const mockDeviceInfo = {
      ip: '127.0.0.1',
      userAgent: 'Test User Agent',
    };

    it('should rotate tokens successfully', async () => {
      const mockPayload = generateApiJwtPayload();
      const oldTokenId = 'old-token-id';

      mockJwtService.signAsync.mockResolvedValueOnce('new-access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('new-refresh-token');
      mockPrismaService.refreshToken.update.mockResolvedValue({});

      jest
        .spyOn(authService as any, 'getRefreshTokenSecret')
        .mockReturnValue('refresh-secret');

      const result = await (authService as any).rotateTokens(
        mockPayload,
        oldTokenId,
        mockDeviceInfo
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          id: mockPayload.id,
          email: mockPayload.email,
          role: mockPayload.role,
        },
        {
          expiresIn: '15m',
        }
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          userId: mockPayload.id,
          tokenId: 'mock-random-bytes',
          type: 'refresh',
        },
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        }
      );

      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: oldTokenId },
        data: {
          id: 'mock-random-bytes',
          token: 'hashed_password',
          user_agent: mockDeviceInfo.userAgent,
          ip_address: mockDeviceInfo.ip,
          expires_at: expect.any(Date),
          last_used_at: expect.any(Date),
        },
      });

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = generateApiRefreshTokenPayload();

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      jest
        .spyOn(authService as any, 'getRefreshTokenSecret')
        .mockReturnValue('refresh-secret');

      const result = await (authService as any).verifyRefreshToken(
        refreshToken
      );

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'refresh-secret',
      });
      expect(result).toEqual(mockPayload);
    });

    it('should throw for invalid token type', async () => {
      const refreshToken = 'invalid-type-token';
      const mockPayload = generateApiJwtPayload();

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      jest
        .spyOn(authService as any, 'getRefreshTokenSecret')
        .mockReturnValue('refresh-secret');

      await expect(
        (authService as any).verifyRefreshToken(refreshToken)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        (authService as any).verifyRefreshToken(refreshToken)
      ).rejects.toThrow(ErrorCode.INVALID_TOKEN);
    });
  });

  describe('updateTokenUsage', () => {
    it('should update token usage information', async () => {
      const tokenId = 'token-id';
      const deviceInfo = {
        ip: '127.0.0.1',
        userAgent: 'Test User Agent',
      };

      mockPrismaService.refreshToken.update.mockResolvedValue({});

      await (authService as any).updateTokenUsage(tokenId, deviceInfo);

      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: tokenId },
        data: {
          last_used_at: expect.any(Date),
          user_agent: deviceInfo.userAgent,
          ip_address: deviceInfo.ip,
        },
      });
    });
  });

  describe('cleanupToken', () => {
    it('should delete a token by ID', async () => {
      const tokenId = 'token-id';

      mockPrismaService.refreshToken.delete.mockResolvedValue({});

      await (authService as any).cleanupToken(tokenId);

      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: tokenId },
      });
    });
  });

  describe('getRefreshTokenSecret', () => {
    it('should return refresh token secret when available', () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'NX_PUBLIC_JWT_REFRESH_SECRET') return 'refresh-secret';
        if (key === 'NX_PUBLIC_JWT_SECRET') return 'jwt-secret';

        return undefined;
      });

      const result = (authService as any).getRefreshTokenSecret();

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'NX_PUBLIC_JWT_REFRESH_SECRET'
      );
      expect(result).toBe('refresh-secret');
    });

    it('should fall back to JWT secret when refresh secret is not available', () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'NX_PUBLIC_JWT_REFRESH_SECRET') return undefined;
        if (key === 'NX_PUBLIC_JWT_SECRET') return 'jwt-secret';

        return undefined;
      });

      const result = (authService as any).getRefreshTokenSecret();

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'NX_PUBLIC_JWT_REFRESH_SECRET'
      );
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'NX_PUBLIC_JWT_SECRET'
      );
      expect(result).toBe('jwt-secret');
    });

    it('should handle missing both secrets', () => {
      mockConfigService.get.mockImplementation(() => undefined);

      const result = (authService as any).getRefreshTokenSecret();

      expect(result).toBeUndefined();
    });
  });
});
