import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import {
  AuthTokensDto,
  RefreshTokenDto,
  UserDto,
  VerifyTokenDto,
  VerifyTokenParamsDto,
} from './dto';
import { AuthSignInDto, CreateUserDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async register(@Body() authParams: CreateUserDto): Promise<UserDto> {
    return this.authService.createUser(authParams);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    type: AuthTokensDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async signIn(
    @Body() authParams: AuthSignInDto,
    @Req() request: Request
  ): Promise<AuthTokensDto> {
    const deviceInfo = this.extractDeviceInfo(request);

    return this.authService.signIn(authParams, deviceInfo);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthTokensDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request
  ): Promise<AuthTokensDto> {
    const deviceInfo = this.extractDeviceInfo(request);

    return this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      deviceInfo
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<{ message: string }> {
    try {
      await this.authService.revokeRefreshToken(refreshTokenDto.refreshToken);

      return { message: 'Logged out successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      throw error;
    }
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({
    status: 200,
    description: 'Logged out from all devices successfully',
  })
  async logoutAll(
    @Body() body: { userId: number }
  ): Promise<{ message: string }> {
    await this.authService.revokeAllRefreshTokens(body.userId);

    return { message: 'Logged out from all devices successfully' };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token verification result',
    type: VerifyTokenDto,
  })
  async verifyToken(
    @Body() verifyTokenRequest: VerifyTokenParamsDto
  ): Promise<VerifyTokenDto> {
    return this.authService.verifyToken(verifyTokenRequest.token);
  }

  private extractDeviceInfo(request: Request) {
    return {
      userAgent: request.get('User-Agent') || 'Unknown',
      ip: this.getClientIp(request),
    };
  }

  private getClientIp(request: Request): string {
    return (
      request.ip ||
      request.connection.remoteAddress ||
      request.headers['x-forwarded-for']?.toString().split(',')[0] ||
      'Unknown'
    );
  }
}
