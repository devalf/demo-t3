import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ErrorCode } from '@demo-t3/models';

import { PrismaService } from '../../prisma/prisma.service';
import { JwtUserUtil } from '../../../common/utils';

import { UserOperationPermissionService } from './user-operation-permission.service';

@Injectable()
export class UserDeletionService {
  private readonly logger = new Logger(UserDeletionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userOperationPermissionService: UserOperationPermissionService,
    private readonly jwtUserUtil: JwtUserUtil
  ) {}

  async softDeleteUser(accessToken: string, targetUserId: number) {
    const currentUser = await this.jwtUserUtil.extractUserFromAccessToken(
      accessToken
    );

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        role: true,
        is_active: true,
        email: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    if (!targetUser.is_active) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    const canDelete =
      this.userOperationPermissionService.canUserPerformActionOnUser(
        currentUser,
        targetUser
      );

    if (!canDelete.allowed) {
      throw new ForbiddenException(canDelete.reason);
    }

    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.refreshToken.deleteMany({
          where: { user_id: targetUserId },
        });

        return prisma.user.update({
          where: { id: targetUserId },
          data: {
            is_active: false,
            updated_at: new Date(),
          },
          select: { id: true, email: true, name: true, is_active: true },
        });
      });
    } catch (error) {
      this.logger.error(
        `Failed to deactivate user ${targetUserId}: ${error.message}`,
        error.stack
      );

      throw error;
    }
  }

  async hardDeleteUser(accessToken: string, targetUserId: number) {
    const currentUser = await this.jwtUserUtil.extractUserFromAccessToken(
      accessToken
    );

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        role: true,
        is_active: true,
        email: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    const canDelete =
      this.userOperationPermissionService.canUserPerformActionOnUser(
        currentUser,
        targetUser
      );

    if (!canDelete.allowed) {
      throw new ForbiddenException(canDelete.reason);
    }

    try {
      await this.prisma.user.delete({
        where: { id: targetUserId },
      });

      return { message: 'User hard deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to hard delete user ${targetUserId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
