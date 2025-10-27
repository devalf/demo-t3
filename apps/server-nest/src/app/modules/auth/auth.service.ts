import { createHash } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { jwtDecode } from 'jwt-decode';
import {
  ApiAuthResponseError,
  ApiAuthSignInParams,
  ApiCreateUserParams,
  ApiDeviceInfo,
  ApiDeviceInfoParams,
  ApiLogoutResponse,
  ApiMessagePayload,
  ApiTokenResponse,
  ApiUpdateUserParams,
  ApiUser,
  ApiVerifyToken,
  ErrorCode,
} from '@demo-t3/models';
import { HttpClient } from '@demo-t3/utils-nest';
import { Redis } from 'ioredis';

type DecodedJwt = {
  exp?: number;
  [key: string]: unknown;
};

type SignInWithDeviceParams = ApiAuthSignInParams & ApiDeviceInfoParams;

type CookieData = {
  value: string;
  maxAge: number;
};

type PreparedCookieData = {
  accessToken: CookieData;
  refreshToken?: CookieData;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authServiceUrl: string;
  private readonly cacheBufferSeconds = 3;
  private readonly minCacheTtlSeconds = 5;
  private readonly httpClient: HttpClient;

  constructor(
    httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {
    this.authServiceUrl = this.buildAuthServiceUrl();
    this.httpClient = new HttpClient(httpService);
  }

  async registerUser(
    params: ApiCreateUserParams,
    deviceInfo: ApiDeviceInfo
  ): Promise<ApiUser | ApiAuthResponseError> {
    const url = `${this.authServiceUrl}/register`;

    try {
      const requestPayload = {
        ...params,
        deviceInfo,
      };

      const response = await this.httpClient.post<
        ApiUser | ApiAuthResponseError
      >(url, requestPayload);

      if (!this.isValidResponse(response, 201, 'id')) {
        const errorResponse = response.data as ApiAuthResponseError;
        const errorCode = errorResponse?.errorCode;
        const statusCode = errorResponse?.statusCode || response.status;

        // If we have an error code, throw the appropriate HTTP exception
        if (errorCode) {
          throw new HttpException(errorCode, statusCode);
        }

        // Fallback to legacy error message handling
        const errorMessages = errorResponse?.message;
        const errorMessage = Array.isArray(errorMessages)
          ? errorMessages.join(', ')
          : errorMessages || 'Registration failed';

        throw new Error(errorMessage);
      }

      return response.data;
    } catch (error) {
      this.logger.error('Registration failed', {
        error: error.message,
        params: { ...params, password: '[REDACTED]' },
        deviceInfo,
      });

      throw error;
    }
  }

  async register(
    params: ApiCreateUserParams,
    deviceInfo: ApiDeviceInfo
  ): Promise<ApiUser | ApiAuthResponseError> {
    try {
      return await this.registerUser(params, deviceInfo);
    } catch (error) {
      this.logger.error('Registration failed', {
        error: error.message,
        params: { ...params, password: '[REDACTED]' },
        deviceInfo,
      });

      throw error;
    }
  }

  async signIn(
    params: ApiAuthSignInParams,
    deviceInfo: ApiDeviceInfo
  ): Promise<ApiTokenResponse> {
    const url = `${this.authServiceUrl}/sign-in`;

    try {
      const requestPayload: SignInWithDeviceParams = {
        ...params,
        deviceInfo,
      };

      const response = await this.httpClient.post<ApiTokenResponse>(
        url,
        requestPayload
      );

      if (!this.isValidResponse(response, 200, 'accessToken')) {
        throw new Error(response.data?.message || 'Invalid credentials');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Sign-in failed', {
        error: error.message,
        params: { ...params, password: '[REDACTED]' },
        deviceInfo,
      });

      throw error;
    }
  }

  async refreshToken(
    refreshToken: string,
    deviceInfo: ApiDeviceInfo
  ): Promise<ApiTokenResponse> {
    const url = `${this.authServiceUrl}/refresh`;

    try {
      const requestPayload = {
        refreshToken,
        deviceInfo,
      };

      const response = await this.httpClient.post<ApiTokenResponse>(
        url,
        requestPayload
      );

      if (!this.isValidResponse(response, 200, 'accessToken')) {
        throw new Error(response.data?.message || 'Invalid refresh token');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Token refresh failed', {
        error: error.message,
        deviceInfo,
      });

      throw error;
    }
  }

  async logout(refreshToken: string): Promise<boolean> {
    const url = `${this.authServiceUrl}/logout`;

    try {
      const requestPayload = {
        refreshToken,
      };

      const response = await this.httpClient.post<ApiLogoutResponse>(
        url,
        requestPayload
      );

      if (!this.isValidResponse(response, 200, 'message')) {
        throw new Error(response.data?.message || 'Logout failed');
      }

      return true;
    } catch (error) {
      this.logger.error('Logout failed', {
        error: error.message,
      });

      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const url = `${this.authServiceUrl}/verify-email`;

    try {
      const response = await this.httpClient.get<ApiMessagePayload>(url, {
        token,
      });

      if (!this.isValidResponse(response, 200, 'message')) {
        throw new BadRequestException(
          response.data?.message || 'Email verification failed'
        );
      }
    } catch (error) {
      this.logger.error('Email verification failed', {
        error: error.message,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || 'Email verification failed'
      );
    }
  }

  async updateUser(params: ApiUpdateUserParams): Promise<ApiUser> {
    const url = `${this.authServiceUrl}/user`;

    try {
      const response = await this.httpClient.patch<ApiUser>(url, params);

      if (!this.isValidResponse(response, 200, 'id')) {
        throw new BadRequestException(ErrorCode.USER_UPDATE_FAILED);
      }

      return response.data;
    } catch (error) {
      this.logger.error('User update failed', {
        error: error.message,
        userId: params.targetUserId,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || ErrorCode.USER_UPDATE_FAILED
      );
    }
  }

  prepareCookieData(tokenResponse: ApiTokenResponse): PreparedCookieData {
    const accessTokenDecoded = jwtDecode(tokenResponse.accessToken);
    const accessTokenMaxAge = Math.max(
      accessTokenDecoded['exp'] * 1000 - Date.now(),
      0
    );

    const cookieData: PreparedCookieData = {
      accessToken: {
        value: tokenResponse.accessToken,
        maxAge: accessTokenMaxAge,
      },
    };

    if (tokenResponse.refreshToken) {
      const refreshTokenDecoded = jwtDecode(tokenResponse.refreshToken);
      const refreshTokenMaxAge = Math.max(
        refreshTokenDecoded['exp'] * 1000 - Date.now(),
        0
      );

      cookieData.refreshToken = {
        value: tokenResponse.refreshToken,
        maxAge: refreshTokenMaxAge,
      };
    }

    return cookieData;
  }

  async verifyToken(accessToken: string): Promise<unknown> {
    if (!accessToken?.trim()) {
      throw new Error('Token is required');
    }

    const cachedPayload = await this.getCachedTokenPayload(accessToken);

    if (cachedPayload) {
      return cachedPayload;
    }

    return this.verifyTokenWithAuthService(accessToken);
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

  private isValidResponse<T extends Record<string, unknown>>(
    response: { status: number; data?: T },
    expectedStatus: number,
    validatorOrKey: ((data: T) => boolean) | string
  ): boolean {
    if (response.status !== expectedStatus || !response.data) return false;

    if (typeof validatorOrKey === 'function') {
      return validatorOrKey(response.data);
    }

    const key = validatorOrKey as keyof T;
    const value = response.data[key];
    return Boolean(value);
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

  private async verifyTokenWithAuthService(
    accessToken: string
  ): Promise<unknown> {
    const url = `${this.authServiceUrl}/verify`;

    try {
      const response = await this.httpClient.post<ApiVerifyToken>(url, {
        accessToken,
      });

      if (!this.isValidResponse(response, 200, 'isValid')) {
        throw new Error(response.data?.error || 'Invalid token');
      }

      const payload = response.data.payload;

      await this.cacheTokenPayload(accessToken, payload);

      return payload;
    } catch (error) {
      this.logger.error('Token verification failed', {
        error: error.message,
        tokenLength: accessToken.length,
      });

      throw error;
    }
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
