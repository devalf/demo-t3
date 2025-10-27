import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiJwtPayload, ErrorCode } from '@demo-t3/models';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../modules/prisma/prisma.service';
import { UserDto } from '../../modules/auth/dto';

@Injectable()
export class JwtUserUtil {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async extractUserFromAccessToken(accessToken: string): Promise<UserDto> {
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
        throw new UnauthorizedException(ErrorCode.USER_NO_LONGER_EXISTS);
      }

      if (!user.is_active) {
        throw new UnauthorizedException(ErrorCode.USER_NOT_ACTIVE);
      }

      if (user.email !== payload.email || user.role !== payload.role) {
        throw new UnauthorizedException(ErrorCode.TOKEN_PAYLOAD_MISMATCH);
      }

      return plainToInstance(UserDto, user);
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException(ErrorCode.INVALID_TOKEN);
      }

      throw error;
    }
  }
}
