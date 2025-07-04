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
import { Request, Response } from 'express';
import { extractDeviceInfo } from '@demo-t3/utils';
import { ApiTokenResponse } from '@demo-t3/models';

import { JwtAuthGuard } from '../../common/guards';
import { AuthSignInDto, CreateUserDto } from '../../dto/auth.dto';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('sign-in')
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
  })
  async signIn(
    @Body() body: AuthSignInDto,
    @Req() request: Request,
    @Res({ passthrough: false }) res: Response
  ) {
    const deviceInfo = extractDeviceInfo(request);

    try {
      const result = await this.authService.signIn(body, deviceInfo);

      this.setCookiesFromTokens(res, result);

      return res.status(200).send();
    } catch (error) {
      return res.status(401).json({ message: error.message || 'Unauthorized' });
    }
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
  @UseGuards(JwtAuthGuard)
  async getMe(@Res() res: Response) {
    return res.status(200).send();
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout',
    description: 'Clears the authentication cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully. accessToken cookie cleared.',
  })
  async logout(@Res({ passthrough: false }) res: Response) {
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

    return res.status(200).send();
  }

  @Post('register')
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
  async registerAndSignIn(
    @Body() body: CreateUserDto,
    @Req() request: Request,
    @Res({ passthrough: false }) res: Response
  ) {
    const deviceInfo = extractDeviceInfo(request);

    try {
      const result = await this.authService.registerAndSignIn(body, deviceInfo);

      this.setCookiesFromTokens(res, result);

      return res.status(201).send();
    } catch (error) {
      if (error.message?.includes('already exists')) {
        return res.status(409).json({ message: error.message });
      }

      return res
        .status(400)
        .json({ message: error.message || 'Registration failed' });
    }
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
  }
}
