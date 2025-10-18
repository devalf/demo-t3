import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { generateOrmUser } from '@demo-t3/utils';

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

describe('AuthService - Token Management Features', () => {
  let authService: AuthService;
  let mockPrismaService: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockUserOperationPermissionService: any;
  let mockJwtUserUtil: any;
  let mockLogger: any;

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

    mockUserOperationPermissionService = {
      canDeleteUser: jest.fn().mockResolvedValue(true),
    };

    mockJwtUserUtil = {
      extractUserFromJwt: jest.fn(),
    };

    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
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

    // Mock the logger to prevent console output during tests
    (authService as any).logger = mockLogger;

    jest.clearAllMocks();
  });

  describe('bulkDeleteTokens', () => {
    it('should delete multiple tokens by ID', async () => {
      const tokenIds = ['token1', 'token2', 'token3'];

      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

      const result = await (authService as any).bulkDeleteTokens(tokenIds);

      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: tokenIds },
        },
      });
      expect(result).toBe(3);
    });

    it('should return 0 when no token IDs provided', async () => {
      const result = await (authService as any).bulkDeleteTokens([]);

      expect(mockPrismaService.refreshToken.deleteMany).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should handle database errors', async () => {
      const tokenIds = ['token1', 'token2'];
      const dbError = new Error('Database connection failed');
      mockPrismaService.refreshToken.deleteMany.mockRejectedValue(dbError);

      await expect(
        (authService as any).bulkDeleteTokens(tokenIds)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('enforceTokenLimit', () => {
    const userId = 123;

    it('should not delete tokens when under limit', async () => {
      const activeTokens = [
        { id: 'token1', last_used_at: new Date('2023-01-01') },
        { id: 'token2', last_used_at: new Date('2023-01-02') },
        { id: 'token3', last_used_at: new Date('2023-01-03') },
      ];

      mockPrismaService.refreshToken.findMany.mockResolvedValue(activeTokens);

      jest.spyOn(authService as any, 'bulkDeleteTokens').mockResolvedValue(0);

      await (authService as any).enforceTokenLimit(userId);

      expect(mockPrismaService.refreshToken.findMany).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          expires_at: { gt: expect.any(Date) },
        },
        orderBy: { last_used_at: 'asc' },
      });
      expect(authService['bulkDeleteTokens']).not.toHaveBeenCalled();
    });

    it('should delete oldest tokens when at limit', async () => {
      const activeTokens = [
        { id: 'token1', last_used_at: new Date('2023-01-01') }, // oldest - should be deleted
        { id: 'token2', last_used_at: new Date('2023-01-02') },
        { id: 'token3', last_used_at: new Date('2023-01-03') },
        { id: 'token4', last_used_at: new Date('2023-01-04') },
        { id: 'token5', last_used_at: new Date('2023-01-05') },
      ];

      mockPrismaService.refreshToken.findMany.mockResolvedValue(activeTokens);
      jest.spyOn(authService as any, 'bulkDeleteTokens').mockResolvedValue(1);

      await (authService as any).enforceTokenLimit(userId);

      expect(authService['bulkDeleteTokens']).toHaveBeenCalledWith(['token1']);
    });

    it('should delete multiple oldest tokens when over limit', async () => {
      const activeTokens = [
        { id: 'token1', last_used_at: new Date('2023-01-01') }, // oldest - should be deleted
        { id: 'token2', last_used_at: new Date('2023-01-02') }, // second oldest - should be deleted
        { id: 'token3', last_used_at: new Date('2023-01-03') },
        { id: 'token4', last_used_at: new Date('2023-01-04') },
        { id: 'token5', last_used_at: new Date('2023-01-05') },
        { id: 'token6', last_used_at: new Date('2023-01-06') },
        { id: 'token7', last_used_at: new Date('2023-01-07') },
      ];

      mockPrismaService.refreshToken.findMany.mockResolvedValue(activeTokens);

      jest.spyOn(authService as any, 'bulkDeleteTokens').mockResolvedValue(3);

      await (authService as any).enforceTokenLimit(userId);

      expect(authService['bulkDeleteTokens']).toHaveBeenCalledWith([
        'token1',
        'token2',
        'token3',
      ]);
    });

    it('should handle null last_used_at values', async () => {
      const activeTokens = [
        { id: 'token1', last_used_at: null }, // null should be treated as oldest
        { id: 'token2', last_used_at: new Date('2023-01-02') },
        { id: 'token3', last_used_at: new Date('2023-01-03') },
        { id: 'token4', last_used_at: new Date('2023-01-04') },
        { id: 'token5', last_used_at: new Date('2023-01-05') },
      ];

      mockPrismaService.refreshToken.findMany.mockResolvedValue(activeTokens);

      jest.spyOn(authService as any, 'bulkDeleteTokens').mockResolvedValue(1);

      await (authService as any).enforceTokenLimit(userId);

      expect(authService['bulkDeleteTokens']).toHaveBeenCalledWith(['token1']);
    });

    it('should handle database errors and rethrow', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.refreshToken.findMany.mockRejectedValue(dbError);

      await expect(
        (authService as any).enforceTokenLimit(userId)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('cleanupExistingDeviceToken', () => {
    const userId = 123;
    const deviceInfo = {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 Test Browser',
    };

    it('should delete existing tokens for same device', async () => {
      const existingTokens = [{ id: 'token1' }, { id: 'token2' }];

      mockPrismaService.refreshToken.findMany.mockResolvedValue(existingTokens);

      jest.spyOn(authService as any, 'bulkDeleteTokens').mockResolvedValue(2);

      await (authService as any).cleanupExistingDeviceToken(userId, deviceInfo);

      expect(mockPrismaService.refreshToken.findMany).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          AND: [
            { user_agent: deviceInfo.userAgent },
            { ip_address: deviceInfo.ip },
          ],
        },
      });
      expect(authService['bulkDeleteTokens']).toHaveBeenCalledWith([
        'token1',
        'token2',
      ]);
    });

    it('should not delete anything when no existing tokens found', async () => {
      mockPrismaService.refreshToken.findMany.mockResolvedValue([]);

      jest.spyOn(authService as any, 'bulkDeleteTokens').mockResolvedValue(0);

      await (authService as any).cleanupExistingDeviceToken(userId, deviceInfo);

      expect(mockPrismaService.refreshToken.findMany).toHaveBeenCalled();
      expect(authService['bulkDeleteTokens']).not.toHaveBeenCalled();
    });

    it('should handle null user agent', async () => {
      const deviceInfoWithNullAgent = {
        ...deviceInfo,
        userAgent: null,
      };

      mockPrismaService.refreshToken.findMany.mockResolvedValue([]);

      await (authService as any).cleanupExistingDeviceToken(
        userId,
        deviceInfoWithNullAgent
      );

      expect(mockPrismaService.refreshToken.findMany).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          AND: [{ user_agent: null }, { ip_address: deviceInfo.ip }],
        },
      });
    });

    it('should handle null IP address', async () => {
      const deviceInfoWithNullIp = {
        ...deviceInfo,
        ip: null,
      };

      mockPrismaService.refreshToken.findMany.mockResolvedValue([]);

      await (authService as any).cleanupExistingDeviceToken(
        userId,
        deviceInfoWithNullIp
      );

      expect(mockPrismaService.refreshToken.findMany).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          AND: [{ user_agent: deviceInfo.userAgent }, { ip_address: null }],
        },
      });
    });

    it('should handle database errors gracefully (not rethrow)', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.refreshToken.findMany.mockRejectedValue(dbError);

      await expect(
        (authService as any).cleanupExistingDeviceToken(userId, deviceInfo)
      ).resolves.toBeUndefined();
    });
  });

  describe('generateTokenPair integration with new methods', () => {
    const mockUser = generateOrmUser();
    const mockDeviceInfo = {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 Test Browser',
    };

    it('should call cleanup methods before token generation', async () => {
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

      await (authService as any).generateTokenPair(mockUser, mockDeviceInfo);

      expect(authService['cleanupExistingDeviceToken']).toHaveBeenCalledWith(
        mockUser.id,
        mockDeviceInfo
      );
      expect(authService['enforceTokenLimit']).toHaveBeenCalledWith(
        mockUser.id
      );
    });

    it('should call cleanup methods in correct order', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      let cleanupCalled = false;
      let enforceCalled = false;
      let cleanupOrder = 0;
      let enforceOrder = 0;

      jest
        .spyOn(authService as any, 'cleanupExistingDeviceToken')
        .mockImplementation(async () => {
          cleanupCalled = true;
          cleanupOrder = Date.now();
        });
      jest
        .spyOn(authService as any, 'enforceTokenLimit')
        .mockImplementation(async () => {
          enforceCalled = true;
          enforceOrder = Date.now();
        });
      jest
        .spyOn(authService as any, 'getRefreshTokenSecret')
        .mockReturnValue('refresh-secret');

      await (authService as any).generateTokenPair(mockUser, mockDeviceInfo);

      expect(cleanupCalled).toBe(true);
      expect(enforceCalled).toBe(true);
      expect(cleanupOrder).toBeLessThanOrEqual(enforceOrder);
    });

    it('should still create token even if cleanup methods fail', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      jest
        .spyOn(authService as any, 'cleanupExistingDeviceToken')
        .mockResolvedValue(undefined);
      jest
        .spyOn(authService as any, 'enforceTokenLimit')
        .mockRejectedValue(new Error('Enforce failed'));
      jest
        .spyOn(authService as any, 'getRefreshTokenSecret')
        .mockReturnValue('refresh-secret');

      await expect(
        (authService as any).generateTokenPair(mockUser, mockDeviceInfo)
      ).rejects.toThrow('Enforce failed');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle concurrent token generation attempts', async () => {
      const userId = 123;

      const activeTokens = new Array(5).fill(null).map((_, i) => ({
        id: `token${i + 1}`,
        last_used_at: new Date(Date.now() - (4 - i) * 1000), // token1 is oldest
      }));

      mockPrismaService.refreshToken.findMany.mockResolvedValue(activeTokens);
      jest.spyOn(authService as any, 'bulkDeleteTokens').mockResolvedValue(1);

      await (authService as any).enforceTokenLimit(userId);

      expect(authService['bulkDeleteTokens']).toHaveBeenCalledWith(['token1']);
    });

    it('should handle tokens with same last_used_at timestamp', async () => {
      const userId = 123;
      const sameTimestamp = new Date('2023-01-01T12:00:00Z');

      const activeTokens = [
        { id: 'token1', last_used_at: sameTimestamp },
        { id: 'token2', last_used_at: sameTimestamp },
        { id: 'token3', last_used_at: sameTimestamp },
        { id: 'token4', last_used_at: sameTimestamp },
        { id: 'token5', last_used_at: sameTimestamp },
        { id: 'token6', last_used_at: sameTimestamp },
      ];

      mockPrismaService.refreshToken.findMany.mockResolvedValue(activeTokens);
      jest.spyOn(authService as any, 'bulkDeleteTokens').mockResolvedValue(2);

      await (authService as any).enforceTokenLimit(userId);

      expect(authService['bulkDeleteTokens']).toHaveBeenCalledWith([
        'token1',
        'token2',
      ]);
    });
  });
});
