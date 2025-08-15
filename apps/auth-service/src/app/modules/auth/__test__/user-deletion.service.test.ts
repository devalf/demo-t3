import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { generateApiJwtPayload, generateOrmUser } from '@demo-t3/utils';

import {
  UserDeletionService,
  UserOperationPermissionService,
} from '../services';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtUserUtil } from '../../../common/utils';

describe('UserDeletionService', () => {
  let userDeletionService: UserDeletionService;
  let mockUserOperationPermissionService: any;
  let mockPrismaService: any;
  let mockJwtUserUtil: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockUserOperationPermissionService = {
      canUserPerformActionOnUser: jest.fn(),
    };

    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      refreshToken: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    mockJwtUserUtil = {
      extractUserFromAccessToken: jest.fn(),
    };

    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    userDeletionService = new UserDeletionService(
      mockPrismaService as PrismaService,
      mockUserOperationPermissionService as UserOperationPermissionService,
      mockJwtUserUtil as JwtUserUtil
    );

    (userDeletionService as any).logger = mockLogger;

    jest.clearAllMocks();
  });

  describe('softDeleteUser', () => {
    it('should successfully soft delete a user with correct parameters', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({ role: 'ADMIN' });

      const mockTargetUser = generateOrmUser({
        id: targetUserId,
        email: 'test2@example.com',
        role: 'CLIENT',
        is_active: true,
      });
      const expectedResult = {
        ...mockTargetUser,
        is_active: false,
      };

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockUserOperationPermissionService.canUserPerformActionOnUser.mockReturnValue(
        {
          allowed: true,
          reason: '',
        }
      );
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          refreshToken: { deleteMany: jest.fn() },
          user: { update: jest.fn().mockResolvedValue(expectedResult) },
        });
      });

      const result = await userDeletionService.softDeleteUser(
        accessToken,
        targetUserId
      );

      expect(mockJwtUserUtil.extractUserFromAccessToken).toHaveBeenCalledWith(
        accessToken
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: targetUserId },
        select: {
          id: true,
          role: true,
          is_active: true,
          email: true,
        },
      });
      expect(
        mockUserOperationPermissionService.canUserPerformActionOnUser
      ).toHaveBeenCalledWith(mockUser, mockTargetUser);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when target user does not exist', async () => {
      const targetUserId = 999;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({
        id: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        userDeletionService.softDeleteUser(accessToken, targetUserId)
      ).rejects.toThrow(NotFoundException);

      expect(mockJwtUserUtil.extractUserFromAccessToken).toHaveBeenCalledWith(
        accessToken
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: targetUserId },
        select: {
          id: true,
          role: true,
          is_active: true,
          email: true,
        },
      });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({
        id: 2,
        email: 'user@example.com',
        role: 'CLIENT',
      });
      const mockTargetUser = generateOrmUser({
        id: targetUserId,
        email: 'admin@example.com',
        role: 'ADMIN',
        is_active: true,
      });

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockUserOperationPermissionService.canUserPerformActionOnUser.mockReturnValue(
        {
          allowed: false,
          reason: 'Insufficient permissions',
        }
      );

      await expect(
        userDeletionService.softDeleteUser(accessToken, targetUserId)
      ).rejects.toThrow(ForbiddenException);

      expect(
        mockUserOperationPermissionService.canUserPerformActionOnUser
      ).toHaveBeenCalledWith(mockUser, mockTargetUser);
    });

    it('should throw NotFoundException when target user is already soft deleted', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({ role: 'ADMIN' });
      const mockTargetUser = generateOrmUser({
        id: targetUserId,
        is_active: false, // Already soft deleted
      });

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);

      await expect(
        userDeletionService.softDeleteUser(accessToken, targetUserId)
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: targetUserId },
        select: {
          id: true,
          role: true,
          is_active: true,
          email: true,
        },
      });
    });

    it('should handle database errors and log them', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({ role: 'ADMIN' });
      const mockTargetUser = generateOrmUser({
        id: targetUserId,
        is_active: true,
      });
      const dbError = new Error('Database connection failed');

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockUserOperationPermissionService.canUserPerformActionOnUser.mockReturnValue(
        {
          allowed: true,
        }
      );
      mockPrismaService.$transaction.mockRejectedValue(dbError);

      await expect(
        userDeletionService.softDeleteUser(accessToken, targetUserId)
      ).rejects.toThrow('Database connection failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to deactivate user ${targetUserId}: ${dbError.message}`,
        dbError.stack
      );
    });
  });

  describe('hardDeleteUser', () => {
    it('should successfully hard delete a user with correct parameters', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({
        id: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
      });
      const mockTargetUser = generateOrmUser({
        id: targetUserId,
      });
      const expectedResult = { message: 'User hard deleted successfully' };

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockUserOperationPermissionService.canUserPerformActionOnUser.mockReturnValue(
        {
          allowed: true,
          reason: '',
        }
      );
      mockPrismaService.user.delete.mockResolvedValue(mockTargetUser);

      const result = await userDeletionService.hardDeleteUser(
        accessToken,
        targetUserId
      );

      expect(mockJwtUserUtil.extractUserFromAccessToken).toHaveBeenCalledWith(
        accessToken
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: targetUserId },
        select: {
          id: true,
          role: true,
          is_active: true,
          email: true,
        },
      });
      expect(
        mockUserOperationPermissionService.canUserPerformActionOnUser
      ).toHaveBeenCalledWith(mockUser, mockTargetUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: targetUserId },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when target user does not exist', async () => {
      const targetUserId = 999;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({
        id: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        userDeletionService.hardDeleteUser(accessToken, targetUserId)
      ).rejects.toThrow(NotFoundException);

      expect(mockJwtUserUtil.extractUserFromAccessToken).toHaveBeenCalledWith(
        accessToken
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: targetUserId },
        select: {
          id: true,
          role: true,
          is_active: true,
          email: true,
        },
      });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({
        id: 2,
        email: 'user@example.com',
        role: 'CLIENT',
      });
      const mockTargetUser = generateOrmUser({
        id: targetUserId,
        role: 'ADMIN',
      });

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockUserOperationPermissionService.canUserPerformActionOnUser.mockReturnValue(
        {
          allowed: false,
          reason: 'Insufficient permissions',
        }
      );

      await expect(
        userDeletionService.hardDeleteUser(accessToken, targetUserId)
      ).rejects.toThrow(ForbiddenException);

      expect(
        mockUserOperationPermissionService.canUserPerformActionOnUser
      ).toHaveBeenCalledWith(mockUser, mockTargetUser);
    });

    it('should successfully hard delete a soft-deleted user', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({ role: 'ADMIN' });
      const mockTargetUser = generateOrmUser({
        id: targetUserId,
        is_active: false, // Soft deleted user
      });
      const expectedResult = { message: 'User hard deleted successfully' };

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockUserOperationPermissionService.canUserPerformActionOnUser.mockReturnValue(
        {
          allowed: true,
        }
      );
      mockPrismaService.user.delete.mockResolvedValue(mockTargetUser);

      const result = await userDeletionService.hardDeleteUser(
        accessToken,
        targetUserId
      );

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: targetUserId },
      });
    });

    it('should handle database errors and log them', async () => {
      const targetUserId = 1;
      const accessToken = 'valid.jwt.token';
      const mockUser = generateApiJwtPayload({ role: 'ADMIN' });
      const mockTargetUser = generateOrmUser({ id: targetUserId });
      const dbError = new Error('Foreign key constraint violation');

      mockJwtUserUtil.extractUserFromAccessToken.mockResolvedValue(mockUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockUserOperationPermissionService.canUserPerformActionOnUser.mockReturnValue(
        {
          allowed: true,
        }
      );
      mockPrismaService.user.delete.mockRejectedValue(dbError);

      await expect(
        userDeletionService.hardDeleteUser(accessToken, targetUserId)
      ).rejects.toThrow('Foreign key constraint violation');

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to hard delete user ${targetUserId}: ${dbError.message}`,
        dbError.stack
      );
    });
  });
});
