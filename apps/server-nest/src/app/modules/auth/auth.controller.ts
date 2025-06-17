import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtDecode } from 'jwt-decode';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../../common/guards';
import { AuthSignInDto } from '../../dto/auth.dto';

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
      'Authenticate a user using email and password. Sets a JWT cookie on success.',
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
    description: 'User signed in successfully. JWT token is set as a cookie.',
  })
  async signIn(
    @Body() body: AuthSignInDto,
    @Res({ passthrough: false }) res: Response
  ) {
    try {
      const result = await this.authService.signIn(body);
      const isProduction = this.configService.get<boolean>('NX_PUBLIC_MODE');

      let maxAge = 60 * 60 * 1000; // fallback: 1h

      try {
        const decoded: unknown = jwtDecode(result.token);
        const exp = decoded['exp'];

        if (exp) {
          maxAge = Math.max(exp * 1000 - Date.now(), 0);
        }
      } catch (error) {
        // fallback to default maxAge
      }

      res.cookie('jwt', result.token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge,
        path: '/',
      });

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
    description: 'Unauthorized. JWT token missing or invalid.',
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
    description: 'User logged out successfully. JWT cookie cleared.',
  })
  async logout(@Res({ passthrough: false }) res: Response) {
    const isProduction = this.configService.get<boolean>('NX_PUBLIC_MODE');

    res.cookie('jwt', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 0,
      path: '/',
    });
    return res.status(200).send();
  }
}
