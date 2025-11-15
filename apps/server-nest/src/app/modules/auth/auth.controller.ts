import { randomBytes } from 'crypto';

import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { extractDeviceInfo } from '@demo-t3/utils';
import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_PUB,
  ApiTokenResponse,
  REFRESH_TOKEN,
  REFRESH_TOKEN_PUB,
} from '@demo-t3/models';
import { UserProfileDto } from '@demo-t3/utils-nest';

import {
  AccessTokenGuard,
  CsrfGuard,
  EmailThrottlerGuard,
  RefreshTokenGuard,
  RolesGuard,
  SkipCsrf,
} from '../../common/guards';
import { RefreshToken, Roles } from '../../common/decorators';
import { AuthenticatedRequest } from '../../common/types';
import {
  AccessTokenExpiresInDto,
  AuthSignInDto,
  CreateUserDto,
  UpdateUserDto,
  VerifyEmailParamsDto,
} from '../../dto/auth.dto';
import { THROTTLER_CONFIG } from '../../constants';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(CsrfGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('sign-in')
  @SkipCsrf()
  @UseGuards(EmailThrottlerGuard)
  @Throttle({
    default: {
      limit: THROTTLER_CONFIG.STRICT.LIMIT,
      ttl: THROTTLER_CONFIG.STRICT.TTL_MILLISECONDS,
    },
  })
  @ApiOperation({
    summary: 'Sign in',
    description:
      'Authenticate a user using email and password. Sets a accessToken cookie on success.',
  })
  @ApiBody({
    description: 'User credentials',
    type: AuthSignInDto,
    examples: {
      valid: {
        summary: 'Valid credentials',
        value: { email: 'user@example.com', password: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'User signed in successfully. accessToken token is set as a cookie.',
    type: AccessTokenExpiresInDto,
  })
  @ApiResponse({
    status: 429,
    description:
      'Too many sign-in attempts for this email address. Please try again later.',
  })
  async signIn(
    @Body() body: AuthSignInDto,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<AccessTokenExpiresInDto> {
    const deviceInfo = extractDeviceInfo(request);

    const result = await this.authService.signIn(body, deviceInfo);

    this.setCookiesFromTokens(res, result);

    const responseDto = plainToInstance(AccessTokenExpiresInDto, {
      accessTokenExpiresIn: result.expiresIn,
    });

    res.status(200);

    return responseDto;
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get authenticated user profile',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. accessToken token missing or invalid.',
  })
  @UseGuards(AccessTokenGuard)
  async getMe(@Req() request: AuthenticatedRequest): Promise<UserProfileDto> {
    const accessToken = request.accessToken;

    return this.authService.getUserProfile(accessToken);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @Throttle({
    default: {
      limit: THROTTLER_CONFIG.STRICT.LIMIT,
      ttl: THROTTLER_CONFIG.STRICT.TTL_MILLISECONDS,
    },
  })
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Refresh the access token using the refresh token from cookies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully. New tokens are set as cookies.',
    type: AccessTokenExpiresInDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many refresh attempts. Please try again later.',
  })
  async refresh(
    @RefreshToken() refreshToken: string,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<AccessTokenExpiresInDto> {
    const deviceInfo = extractDeviceInfo(request);

    const result = await this.authService.refreshToken(
      refreshToken,
      deviceInfo
    );

    this.setCookiesFromTokens(res, result);

    const responseDto = plainToInstance(AccessTokenExpiresInDto, {
      accessTokenExpiresIn: result.expiresIn,
    });

    res.status(200);

    return responseDto;
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @Throttle({
    default: {
      limit: THROTTLER_CONFIG.STRICT.LIMIT,
      ttl: THROTTLER_CONFIG.STRICT.TTL_MILLISECONDS,
    },
  })
  @ApiOperation({
    summary: 'Logout',
    description: 'Clears the authentication cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully. accessToken cookie cleared.',
  })
  async logout(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: false }) res: Response
  ) {
    await this.authService.logout(refreshToken);

    res.clearCookie(ACCESS_TOKEN);
    res.clearCookie(REFRESH_TOKEN);
    res.clearCookie(ACCESS_TOKEN_PUB);
    res.clearCookie(REFRESH_TOKEN_PUB);

    return res.status(200).send();
  }

  @Post('register')
  @SkipCsrf()
  @Throttle({
    default: {
      limit: THROTTLER_CONFIG.RIGID.LIMIT,
      ttl: THROTTLER_CONFIG.RIGID.TTL_MILLISECONDS,
    },
  })
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Register a new user. A verification email will be sent. User must verify email before signing in.',
  })
  @ApiBody({
    description: 'User registration data',
    type: CreateUserDto,
    examples: {
      valid: {
        summary: 'Valid registration data',
        value: { email: 'user@example.com', password: 'Password123!' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Verification email sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. User with this email already exists.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many registration attempts. Please try again later.',
  })
  async register(
    @Body() body: CreateUserDto,
    @Req() request: Request,
    @Res({ passthrough: false }) res: Response
  ) {
    const deviceInfo = extractDeviceInfo(request);

    await this.authService.register(body, deviceInfo);

    return res.status(201).send();
  }

  @Get('verify-email')
  @Throttle({
    default: {
      limit: THROTTLER_CONFIG.RIGID.LIMIT,
      ttl: THROTTLER_CONFIG.RIGID.TTL_MILLISECONDS,
    },
  })
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verify user email using token from email link.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many verification attempts. Please try again later.',
  })
  async verifyEmail(
    @Query() params: VerifyEmailParamsDto,
    @Res({ passthrough: false }) res: Response
  ) {
    const { token } = params;

    await this.authService.verifyEmail(token);

    return res.status(200).send();
  }

  @Patch('user')
  @Roles('ADMIN')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Throttle({
    default: {
      limit: THROTTLER_CONFIG.RIGID.LIMIT,
      ttl: THROTTLER_CONFIG.RIGID.TTL_MILLISECONDS,
    },
  })
  @ApiOperation({
    summary: 'Update user information',
    description:
      'Update user information. Admin only endpoint for managing user data including email verification status.',
  })
  @ApiBody({
    description: 'User update data',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Access token missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many update attempts. Please try again later.',
  })
  async updateUser(
    @Body() body: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: false }) res: Response
  ) {
    await this.authService.updateUser({
      ...body,
      accessToken: request.accessToken,
    });

    return res.status(200).send();
  }

  private setCookiesFromTokens(
    res: Response,
    tokenResponse: ApiTokenResponse
  ): void {
    const isProduction = this.configService.get<boolean>('NX_PUBLIC_MODE');
    const cookieData = this.authService.prepareCookieData(tokenResponse);

    const baseCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('strict' as const) : ('lax' as const),
      path: '/',
    };

    const maxAgeCommon = cookieData.refreshToken
      ? cookieData.refreshToken.maxAge
      : cookieData.accessToken.maxAge;

    res.cookie(ACCESS_TOKEN, cookieData.accessToken.value, {
      ...baseCookieOptions,
      maxAge: cookieData.accessToken.maxAge,
    });

    if (cookieData.refreshToken) {
      res.cookie(REFRESH_TOKEN, cookieData.refreshToken.value, {
        ...baseCookieOptions,
        maxAge: cookieData.refreshToken.maxAge,
      });
    }

    res.cookie(ACCESS_TOKEN_PUB, '1', {
      ...baseCookieOptions,
      httpOnly: false,
      maxAge: cookieData.accessToken.maxAge,
    });

    res.cookie(REFRESH_TOKEN_PUB, '1', {
      ...baseCookieOptions,
      httpOnly: false,
      maxAge: maxAgeCommon,
    });

    const csrfToken = randomBytes(32).toString('base64');

    res.cookie('csrfToken', csrfToken, {
      ...baseCookieOptions,
      httpOnly: false,
      maxAge: maxAgeCommon,
    });
  }
}
