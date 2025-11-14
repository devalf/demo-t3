import { randomBytes } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
import {
  ApiAuthSignInParams,
  ApiCreateUserParams,
  ApiDeviceInfo,
  ApiJwtPayload,
  ApiRefreshTokenPayload,
  ApiUpdateUserBasicParams,
  ErrorCode,
} from '@demo-t3/models';
import { plainToInstance } from 'class-transformer';
import { UserProfileDto } from '@demo-t3/utils-nest';

import { PrismaService } from '../prisma/prisma.service';
import { SALT_ROUNDS, TOKEN_CONFIG } from '../../constants';
import { User as UserEntity } from '../../../prisma-setup/generated';
import { JwtUserUtil } from '../../common/utils';

import {
  AuthTokensDto,
  LogoutAllResponseDto,
  UserDto,
  VerifyEmailResponseDto,
} from './dto';
import {
  EmailVerificationTokenService,
  UserOperationPermissionService,
} from './services';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly userOperationPermissionService: UserOperationPermissionService,
    private readonly jwtUserUtil: JwtUserUtil,
    private readonly emailVerificationTokenService: EmailVerificationTokenService
  ) {}

  async createUser(userData: ApiCreateUserParams): Promise<UserDto> {
    const { email, password, name } = userData;
    const normalizedEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await this.checkIfUserUnverifiedAndDelete(normalizedEmail);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        original_email: normalizedEmail,
      },
    });

    return plainToInstance(UserDto, user);
  }

  async updateUser(
    accessToken: string,
    targetUserId: number,
    data: ApiUpdateUserBasicParams
  ): Promise<UserProfileDto> {
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

    if (!targetUser || !targetUser.is_active) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    const canUpdate =
      this.userOperationPermissionService.canUserPerformActionOnUser(
        currentUser,
        targetUser
      );

    if (!canUpdate.allowed) {
      throw new ForbiddenException(canUpdate.reason);
    }

    // Only admins can modify email_verified status
    if (data.email_verified !== undefined && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException(ErrorCode.PERMISSION_DENIED);
    }

    const updateData: ApiUpdateUserBasicParams = {};

    if (data.email !== undefined) {
      updateData.email = data.email.toLowerCase();
    }

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email_verified !== undefined) {
      updateData.email_verified = data.email_verified;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    this.logger.log(`User ${targetUserId} updated by user ${currentUser.id}`);

    return plainToInstance(UserProfileDto, updatedUser);
  }

  async getUserProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, is_active: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        settings: true,
        email_verified: true,
      },
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    return plainToInstance(UserProfileDto, user);
  }

  async checkIfUserUnverifiedAndDelete(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    if (user.email_verified) {
      throw new ConflictException(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    // User exists but email is not verified
    // Check if the unverified account has expired
    const expirationTime = new Date(
      Date.now() - TOKEN_CONFIG.EMAIL_VERIFICATION_TOKEN.MILLISECONDS
    );

    if (user.created_at < expirationTime) {
      await this.prisma.user.delete({
        where: { id: user.id },
      });

      this.logger.log(`Deleted expired unverified account for email: ${email}`);

      return;
    }

    // Account is still within the verification period
    throw new ConflictException(ErrorCode.UNVERIFIED_ACCOUNT_EXISTS);
  }

  async signIn(
    credentials: ApiAuthSignInParams,
    deviceInfo: ApiDeviceInfo
  ): Promise<AuthTokensDto> {
    const { email, password } = credentials;
    const normalizedEmail = email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.is_active) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    if (!user.email_verified) {
      throw new ForbiddenException(ErrorCode.EMAIL_NOT_VERIFIED);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
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
        throw new UnauthorizedException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
      }

      if (storedToken.expires_at < new Date()) {
        await this.cleanupToken(payload.tokenId);

        throw new UnauthorizedException(ErrorCode.TOKEN_EXPIRED);
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

        throw new UnauthorizedException(ErrorCode.REFRESH_TOKEN_INVALID);
      }

      if (!storedToken.user) {
        throw new ForbiddenException(ErrorCode.USER_NO_LONGER_EXISTS);
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
        throw new UnauthorizedException(ErrorCode.REFRESH_TOKEN_INVALID);
      }

      throw error;
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      await this.cleanupToken(payload.tokenId);
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'UnauthorizedException'
      ) {
        this.logger.warn(`Failed to revoke refresh token: ${error.message}`);

        throw new UnauthorizedException(ErrorCode.REFRESH_TOKEN_INVALID);
      }

      throw error;
    }
  }

  async revokeAllRefreshTokens(userId: number): Promise<number> {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: { user_id: userId },
      });

      return result.count;
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
        throw new ForbiddenException(ErrorCode.USER_NO_LONGER_EXISTS);
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

      return result.count;
    } catch (error) {
      this.logger.error(`Failed to cleanup expired tokens: ${error.message}`);

      throw error;
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupUnverifiedUsers(): Promise<number> {
    this.logger.debug('Running unverified users cleanup job');

    try {
      const expirationTime = new Date(
        Date.now() - TOKEN_CONFIG.EMAIL_VERIFICATION_TOKEN.MILLISECONDS
      );

      const result = await this.prisma.user.deleteMany({
        where: {
          email_verified: false,
          created_at: {
            lt: expirationTime,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Cleanup job completed: ${result.count} unverified user(s) removed`
        );
      }

      return result.count;
    } catch (error) {
      this.logger.error(
        `Unverified users cleanup job failed: ${error.message}`,
        error.stack
      );

      throw error;
    }
  }

  async logoutAllDevices(
    accessToken: string,
    targetUserId: number
  ): Promise<LogoutAllResponseDto> {
    const currentUser = await this.jwtUserUtil.extractUserFromAccessToken(
      accessToken
    );

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
      },
    });

    if (!targetUser || !targetUser.is_active) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    const canPerformAction =
      this.userOperationPermissionService.canUserPerformActionOnUser(
        currentUser,
        targetUser
      );

    if (!canPerformAction.allowed) {
      throw new ForbiddenException(canPerformAction.reason);
    }

    const revokedCount = await this.revokeAllRefreshTokens(targetUserId);

    return {
      message: 'Logged out from all devices successfully',
      devicesLoggedOut: revokedCount,
      timestamp: new Date().toISOString(),
    };
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponseDto> {
    const userId = await this.emailVerificationTokenService.verifyToken(token);

    if (!userId) {
      throw new BadRequestException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }

    const userIdNum = parseInt(userId, 10);

    if (isNaN(userIdNum)) {
      throw new BadRequestException(ErrorCode.INVALID_USER_ID);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userIdNum },
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    if (!user.is_active) {
      throw new BadRequestException(ErrorCode.USER_NOT_ACTIVE);
    }

    if (user.email_verified) {
      throw new BadRequestException(ErrorCode.EMAIL_ALREADY_VERIFIED);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userIdNum },
      data: {
        email_verified: true,
        email_verified_at: new Date(),
      },
    });

    await this.emailVerificationTokenService.invalidateToken(token);

    this.logger.log(`Email verified successfully for user ${user.email}`);

    return {
      message: 'Email verified successfully',
      email: updatedUser.email,
      verifiedAt: updatedUser.email_verified_at.toISOString(),
    };
  }

  private async bulkDeleteTokens(tokenIds: string[]): Promise<number> {
    if (tokenIds.length === 0) {
      return 0;
    }

    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        id: { in: tokenIds },
      },
    });

    return result.count;
  }

  private async enforceTokenLimit(userId: number): Promise<void> {
    try {
      const activeTokens = await this.prisma.refreshToken.findMany({
        where: {
          user_id: userId,
          expires_at: { gt: new Date() },
        },
        orderBy: { last_used_at: 'asc' },
      });

      if (
        activeTokens.length >=
        TOKEN_CONFIG.TOKEN_LIMITS.MAX_REFRESH_TOKENS_PER_USER
      ) {
        const tokensToRemove = activeTokens.slice(
          0,
          activeTokens.length -
            TOKEN_CONFIG.TOKEN_LIMITS.MAX_REFRESH_TOKENS_PER_USER +
            1
        );

        const tokenIdsToRemove = tokensToRemove.map((token) => token.id);

        await this.bulkDeleteTokens(tokenIdsToRemove);
      }
    } catch (error) {
      this.logger.error(
        `Failed to enforce token limit for user ${userId}: ${error.message}`
      );

      throw error;
    }
  }

  private async cleanupExistingDeviceToken(
    userId: number,
    deviceInfo: ApiDeviceInfo
  ): Promise<void> {
    try {
      const existingTokens = await this.prisma.refreshToken.findMany({
        where: {
          user_id: userId,
          AND: [
            { user_agent: deviceInfo.userAgent },
            { ip_address: deviceInfo.ip },
          ],
        },
      });

      if (existingTokens.length > 0) {
        const tokenIdsToRemove = existingTokens.map((token) => token.id);

        await this.bulkDeleteTokens(tokenIdsToRemove);
      }
    } catch (error) {
      this.logger.error(
        `Failed to cleanup existing device token for user ${userId}: ${error.message}`
      );
    }
  }

  private async generateTokenPair(
    user: UserEntity,
    deviceInfo: ApiDeviceInfo
  ): Promise<AuthTokensDto> {
    await this.cleanupExistingDeviceToken(user.id, deviceInfo);
    await this.enforceTokenLimit(user.id);

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
        ip_address: deviceInfo.ip,
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

    const newTokenId = randomBytes(32).toString('hex');
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
      throw new UnauthorizedException(ErrorCode.INVALID_TOKEN);
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
