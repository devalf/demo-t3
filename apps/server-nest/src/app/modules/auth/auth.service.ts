import { createHash } from 'crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import {
  ApiAuthSignInParams,
  ApiTokenResponse,
  ApiVerifyToken,
} from '@demo-t3/models';
import { Redis } from 'ioredis';

type DecodedJwt = {
  exp?: number;
  [key: string]: unknown;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authServiceUrl: string;
  private readonly cacheBufferSeconds = 3;
  private readonly minCacheTtlSeconds = 5;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {
    this.authServiceUrl = this.buildAuthServiceUrl();
  }

  async signIn(params: ApiAuthSignInParams): Promise<ApiTokenResponse> {
    const url = `${this.authServiceUrl}/sign-in`;

    try {
      // TODO pass from server-nest the data related to ApiDeviceInfo

      const response = await this.makeHttpRequest<ApiTokenResponse>(
        url,
        params
      );

      if (!this.isValidSignInResponse(response)) {
        throw new Error(response.data?.message || 'Invalid credentials');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Sign-in failed', {
        error: error.message,
        params: { ...params, password: '[REDACTED]' },
      });

      throw error;
    }
  }

  async verifyToken(token: string): Promise<unknown> {
    if (!token?.trim()) {
      throw new Error('Token is required');
    }

    const cachedPayload = await this.getCachedTokenPayload(token);

    if (cachedPayload) {
      return cachedPayload;
    }

    return this.verifyTokenWithAuthService(token);
  }

  private buildAuthServiceUrl(): string {
    const host = this.configService.getOrThrow<string>(
      'NX_PUBLIC_AUTH_SERVICE_HOST'
    );
    const port = this.configService.getOrThrow<string>(
      'NX_PUBLIC_AUTH_SERVICE_PORT'
    );

    return `http://${host}:${port}/api/auth`;
  }

  private async makeHttpRequest<T>(
    url: string,
    data: unknown
  ): Promise<{ status: number; data: T }> {
    return firstValueFrom(
      this.httpService.post(url, data, {
        validateStatus: () => true,
        timeout: 5000, // 5 second timeout
      })
    );
  }

  private isValidSignInResponse(response: {
    status: number;
    data?: ApiTokenResponse;
  }): boolean {
    return response.status === 200 && Boolean(response.data?.accessToken);
  }

  private async getCachedTokenPayload(token: string): Promise<unknown | null> {
    const redisKey = this.buildRedisKey(token);

    try {
      const cached = await this.redisClient.get(redisKey);

      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn('Failed to parse cached token payload, ignoring cache', {
        error: error.message,
        redisKey,
      });

      return null;
    }
  }

  private async verifyTokenWithAuthService(token: string): Promise<unknown> {
    const url = `${this.authServiceUrl}/verify`;

    try {
      const response = await this.makeHttpRequest<ApiVerifyToken>(url, {
        token,
      });

      if (!this.isValidVerificationResponse(response)) {
        throw new Error(response.data?.error || 'Invalid token');
      }

      const payload = response.data.payload;

      await this.cacheTokenPayload(token, payload);

      return payload;
    } catch (error) {
      this.logger.error('Token verification failed', {
        error: error.message,
        tokenLength: token.length,
      });
      throw error;
    }
  }

  private isValidVerificationResponse(response: {
    status: number;
    data?: ApiVerifyToken;
  }): boolean {
    return response.status === 200 && response.data?.isValid === true;
  }

  private async cacheTokenPayload(
    token: string,
    payload: unknown
  ): Promise<void> {
    try {
      const ttl = this.calculateCacheTtl(token);

      if (ttl <= this.minCacheTtlSeconds) {
        return;
      }

      const redisKey = this.buildRedisKey(token);

      await this.redisClient.setex(redisKey, ttl, JSON.stringify(payload));
    } catch (error) {
      this.logger.warn('Failed to cache token payload', {
        error: error.message,
      });
    }
  }

  private calculateCacheTtl(token: string): number {
    try {
      const decoded = this.jwtService.decode(token) as DecodedJwt;

      if (!decoded?.exp) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);

      return Math.max(0, decoded.exp - now - this.cacheBufferSeconds);
    } catch (error) {
      this.logger.warn(
        'Could not decode accessToken for exp field, skipping cache',
        {
          error: error.message,
        }
      );

      return 0;
    }
  }

  private buildRedisKey(token: string): string {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    return `auth:token:${tokenHash}`;
  }
}
