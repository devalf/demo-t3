import {
  Body,
  Controller,
  Get,
  Post,
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
import { ApiTokenResponse } from '@demo-t3/models';

import {
  AccessTokenGuard,
  EmailThrottlerGuard,
  RefreshTokenGuard,
} from '../../common/guards';
import { RefreshToken } from '../../common/decorators';
import {
  AccessTokenExpiresInDto,
  AuthSignInDto,
  CreateUserDto,
} from '../../dto/auth.dto';
import { THROTTLER_CONFIG } from '../../constants';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('sign-in')
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
  @ApiResponse({
    status: 200,
    description:
      'Authenticated user returned successfully. No body is returned.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. accessToken token missing or invalid.',
  })
  @UseGuards(AccessTokenGuard)
  async getMe(@Res() res: Response) {
    return res.status(200).send();
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
    const isProduction = this.configService.get<boolean>('NX_PUBLIC_MODE');

    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 0,
      path: '/',
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 0,
      path: '/',
    });

    res.cookie('sessionPresent', '', {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 0,
      path: '/',
    });

    await this.authService.logout(refreshToken);

    return res.status(200).send();
  }

  @Post('register')
  @Throttle({
    default: {
      limit: THROTTLER_CONFIG.RIGID.LIMIT,
      ttl: THROTTLER_CONFIG.RIGID.TTL_MILLISECONDS,
    },
  })
  @ApiOperation({
    summary: 'Register and sign in user',
    description:
      'Register a new user and immediately sign them in. Sets accessToken and refreshToken cookies on success.' +
      'This is simplified DEMO version, without the necessary steps such as email verification.',
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
    description:
      'User registered and signed in successfully. Authentication cookies are set.',
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
  async registerAndSignIn(
    @Body() body: CreateUserDto,
    @Req() request: Request,
    @Res({ passthrough: false }) res: Response
  ) {
    const deviceInfo = extractDeviceInfo(request);

    const result = await this.authService.registerAndSignIn(body, deviceInfo);

    this.setCookiesFromTokens(res, result);

    return res.status(201).send();
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

    res.cookie('accessToken', cookieData.accessToken.value, {
      ...baseCookieOptions,
      maxAge: cookieData.accessToken.maxAge,
    });

    if (cookieData.refreshToken) {
      res.cookie('refreshToken', cookieData.refreshToken.value, {
        ...baseCookieOptions,
        maxAge: cookieData.refreshToken.maxAge,
      });
    }

    res.cookie('sessionPresent', '1', {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: cookieData.refreshToken
        ? cookieData.refreshToken.maxAge
        : cookieData.accessToken.maxAge,
    });
  }
}
