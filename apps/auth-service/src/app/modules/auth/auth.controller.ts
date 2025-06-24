import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { extractDeviceInfo } from '@demo-t3/utils';

import { AuthService } from './auth.service';
import {
  AuthSignInDto,
  AuthTokensDto,
  CreateUserDto,
  DeleteUserDto,
  DeleteUserParamsDto,
  LogoutAllRequestDto,
  LogoutAllResponseDto,
  LogoutResponseDto,
  RefreshTokenDto,
  RefreshTokenWithDeviceDto,
  UserDto,
  VerifyAccessTokenParamsDto,
  VerifyTokenDto,
} from './dto';

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
    @Body() body: AuthSignInDto,
    @Req() request: Request
  ): Promise<AuthTokensDto> {
    const { email, password, deviceInfo } = body;
    const finalDeviceInfo = extractDeviceInfo(request, deviceInfo);

    return this.authService.signIn({ email, password }, finalDeviceInfo);
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
    @Body() body: RefreshTokenWithDeviceDto,
    @Req() request: Request
  ): Promise<AuthTokensDto> {
    const { refreshToken, deviceInfo } = body;
    const finalDeviceInfo = extractDeviceInfo(request, deviceInfo);

    return this.authService.refreshToken(refreshToken, finalDeviceInfo);
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
  ): Promise<LogoutResponseDto> {
    try {
      await this.authService.revokeRefreshToken(refreshTokenDto.refreshToken);

      return {
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      throw error;
    }
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout from all devices',
    description:
      'This endpoint is intended for internal microservice use only. The consumer of this endpoint is responsible for ' +
      'securely extracting the userId from the authenticated user context and providing it in the request body.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out from all devices successfully',
  })
  async logoutAll(
    @Body() body: LogoutAllRequestDto
  ): Promise<LogoutAllResponseDto> {
    const revokedCount = await this.authService.revokeAllRefreshTokens(
      body.userId
    );

    return {
      message: 'Logged out from all devices successfully',
      devicesLoggedOut: revokedCount,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a accessToken token',
    description:
      'This endpoint is intended for one-time token verification and is not suitable for repeated or continuous validations. ' +
      'The consumer of this endpoint is responsible for implementing an in-memory solution to track and manage already ' +
      'verified tokens. This approach minimizes network overhead and latency.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token verification result',
    type: VerifyTokenDto,
  })
  async verifyToken(
    @Body() verifyTokenRequest: VerifyAccessTokenParamsDto
  ): Promise<VerifyTokenDto> {
    return this.authService.verifyToken(verifyTokenRequest.accessToken);
  }

  @Delete('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a user by ID',
    description:
      'This endpoint is intended for internal microservice use only. The consumer service is responsible for' +
      ' authenticating the user and providing the authenticated user context.',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(
    @Body() params: DeleteUserParamsDto
  ): Promise<DeleteUserDto> {
    await this.authService.deleteUser(params.targetUserId, params.accessToken);

    return { message: 'User deleted successfully' };
  }
}
