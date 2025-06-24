import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiJwtPayload } from '@demo-t3/models';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from '../dto';

@Injectable()
export class UserDeletionService {
  private readonly logger = new Logger(UserDeletionService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async softDeleteUser(targetUserId: number, accessToken: string) {
    const currentUser = await this.extractUserFromAccessToken(accessToken);

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
      throw new NotFoundException('User not found');
    }

    if (!targetUser.is_active) {
      throw new NotFoundException('User not found');
    }

    const canDelete = this.canUserDelete(currentUser, targetUser);

    if (!canDelete.allowed) {
      throw new ForbiddenException(canDelete.reason);
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
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

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to deactivate user ${targetUserId}: ${error.message}`,
        error.stack
      );

      throw error;
    }
  }

  async hardDeleteUser(targetUserId: number, accessToken: string) {
    const currentUser = await this.extractUserFromAccessToken(accessToken);

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
      throw new NotFoundException('User not found');
    }

    const canDelete = this.canUserDelete(currentUser, targetUser);

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

  private canUserDelete(
    currentUser: UserDto,
    targetUser: Partial<UserDto>
  ): { allowed: boolean; reason?: string } {
    // Self-deletion: user can delete their own account
    if (currentUser.id === targetUser.id) {
      return { allowed: true };
    }

    // Admin can delete any non-admin user
    if (currentUser.role === 'ADMIN') {
      // Prevent admin from deleting other admins (optional business rule)
      if (targetUser.role === 'ADMIN') {
        return {
          allowed: false,
          reason: 'Admins cannot delete other admin accounts',
        };
      }

      return { allowed: true };
    }

    // Manager can delete CLIENT users only (optional business rule)
    if (currentUser.role === 'MANAGER' && targetUser.role === 'CLIENT') {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'Insufficient permissions to delete this user',
    };
  }

  private async extractUserFromAccessToken(
    accessToken: string
  ): Promise<UserDto> {
    try {
      const payload = await this.jwtService.verifyAsync<ApiJwtPayload>(
        accessToken
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('User account is inactive');
      }

      if (user.email !== payload.email || user.role !== payload.role) {
        throw new UnauthorizedException(
          'Token payload does not match current user state'
        );
      }

      return plainToInstance(UserDto, user);
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired access token');
      }

      throw error;
    }
  }
}
