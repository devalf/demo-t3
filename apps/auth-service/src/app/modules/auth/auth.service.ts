import { randomBytes } from 'crypto';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import {
  ApiAuthSignInParams,
  ApiCreateUserParams,
  ApiDeviceInfo,
  ApiJwtPayload,
  ApiRefreshTokenPayload,
} from '@demo-t3/models';

import { PrismaService } from '../prisma/prisma.service';
import { SALT_ROUNDS, TOKEN_CONFIG } from '../../constants';
import { User as UserEntity } from '../../../prisma-setup/generated';

import { AuthTokensDto, UserDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async createUser(userData: ApiCreateUserParams): Promise<UserDto> {
    const { email, password, name } = userData;

    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      return plainToInstance(UserDto, user);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
  }

  async updateUser(id: number, data: { email?: string }) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error(`Failed to update user ${id}: ${error.message}`);

      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}: ${error.message}`);
      throw error;
    }
  }

  async signIn(
    credentials: ApiAuthSignInParams,
    deviceInfo: ApiDeviceInfo
  ): Promise<AuthTokensDto> {
    const { email, password } = credentials;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateTokenPair(user, deviceInfo);
  }

  async refreshToken(
    refreshToken: string,
    deviceInfo: ApiDeviceInfo
  ): Promise<AuthTokensDto> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (storedToken.expires_at < new Date()) {
        await this.cleanupToken(payload.tokenId);

        throw new UnauthorizedException('Refresh token expired');
      }

      const isValidToken = await bcrypt.compare(
        refreshToken,
        storedToken.token
      );

      if (!isValidToken) {
        await this.revokeAllRefreshTokens(storedToken.user_id);

        this.logger.warn(
          `Potential token theft detected for user ${storedToken.user_id}`
        );

        throw new UnauthorizedException(
          'Invalid refresh token - all sessions revoked'
        );
      }

      if (!storedToken.user) {
        throw new ForbiddenException('User no longer exists');
      }

      await this.updateTokenUsage(payload.tokenId, deviceInfo);

      return await this.rotateTokens(
        storedToken.user,
        payload.tokenId,
        deviceInfo
      );
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      throw error;
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      await this.cleanupToken(payload.tokenId);

      this.logger.log(`Refresh token revoked: ${payload.tokenId}`);
    } catch (error) {
      // Token might be invalid or already deleted, which is acceptable for logout
      this.logger.warn(`Failed to revoke refresh token: ${error.message}`);
    }
  }

  async revokeAllRefreshTokens(userId: number): Promise<void> {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: { user_id: userId },
      });

      this.logger.log(
        `Revoked ${result.count} refresh tokens for user ${userId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to revoke all tokens for user ${userId}: ${error.message}`
      );

      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<ApiJwtPayload>(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new ForbiddenException('User no longer exists');
      }

      return {
        isValid: true,
        payload,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          expires_at: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired refresh tokens`); // TODO delete all unnecessary loggers

      return result.count;
    } catch (error) {
      this.logger.error(`Failed to cleanup expired tokens: ${error.message}`);

      throw error;
    }
  }

  private async generateTokenPair(
    user: UserEntity,
    deviceInfo: ApiDeviceInfo
  ): Promise<AuthTokensDto> {
    const accessTokenPayload: ApiJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: TOKEN_CONFIG.ACCESS_TOKEN.JWT_EXPIRY,
    });

    const tokenId = randomBytes(32).toString('hex');

    const refreshTokenPayload: ApiRefreshTokenPayload = {
      userId: user.id,
      tokenId,
      type: 'refresh',
    };

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: TOKEN_CONFIG.REFRESH_TOKEN.JWT_EXPIRY,
    });

    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        user_id: user.id,
        token: await bcrypt.hash(refreshToken, SALT_ROUNDS),
        user_agent: deviceInfo.userAgent,
        ip_address: deviceInfo.ip, // TODO define DTO model that is mandatory to pass to this microservice
        expires_at: new Date(
          Date.now() + TOKEN_CONFIG.REFRESH_TOKEN.MILLISECONDS
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: TOKEN_CONFIG.ACCESS_TOKEN.SECONDS,
    };
  }

  private async rotateTokens(
    user: UserEntity,
    oldTokenId: string,
    deviceInfo: ApiDeviceInfo
  ): Promise<AuthTokensDto> {
    const accessTokenPayload: ApiJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: TOKEN_CONFIG.ACCESS_TOKEN.JWT_EXPIRY,
    });

    const newTokenId = randomBytes(32).toString('hex'); // TODO use DRY approach
    const newRefreshTokenPayload: ApiRefreshTokenPayload = {
      userId: user.id,
      tokenId: newTokenId,
      type: 'refresh',
    };

    const newRefreshToken = await this.jwtService.signAsync(
      newRefreshTokenPayload,
      {
        secret: this.getRefreshTokenSecret(),
        expiresIn: TOKEN_CONFIG.REFRESH_TOKEN.JWT_EXPIRY,
      }
    );

    await this.prisma.refreshToken.update({
      where: { id: oldTokenId },
      data: {
        id: newTokenId,
        token: await bcrypt.hash(newRefreshToken, SALT_ROUNDS),
        user_agent: deviceInfo.userAgent,
        ip_address: deviceInfo.ip,
        expires_at: new Date(
          Date.now() + TOKEN_CONFIG.REFRESH_TOKEN.MILLISECONDS
        ),
        last_used_at: new Date(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: TOKEN_CONFIG.ACCESS_TOKEN.SECONDS,
    };
  }

  private async verifyRefreshToken(
    refreshToken: string
  ): Promise<ApiRefreshTokenPayload> {
    const payload = await this.jwtService.verifyAsync<ApiRefreshTokenPayload>(
      refreshToken,
      {
        secret: this.getRefreshTokenSecret(),
      }
    );

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  private async updateTokenUsage(
    tokenId: string,
    deviceInfo: ApiDeviceInfo
  ): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        last_used_at: new Date(),
        user_agent: deviceInfo.userAgent,
        ip_address: deviceInfo.ip,
      },
    });
  }

  private async cleanupToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { id: tokenId },
    });
  }

  private getRefreshTokenSecret(): string {
    return (
      this.configService.get('NX_PUBLIC_JWT_REFRESH_SECRET') ||
      this.configService.get('NX_PUBLIC_JWT_SECRET')
    );
  }
}
