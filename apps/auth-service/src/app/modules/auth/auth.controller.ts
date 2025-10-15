import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { extractDeviceInfo } from '@demo-t3/utils';
import { UserRegistrationInitiatedEvent } from '@demo-t3/models';

import { EmailServiceClient } from '../messaging';
import { TOKEN_CONFIG } from '../../constants';

import { AuthService } from './auth.service';
import { EmailVerificationTokenService, UserDeletionService } from './services';
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
  VerifyEmailQueryDto,
  VerifyEmailResponseDto,
  VerifyTokenDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userDeletionService: UserDeletionService,
    private readonly emailVerificationTokenService: EmailVerificationTokenService,
    private readonly emailServiceClient: EmailServiceClient
  ) {}

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
  async register(@Body() body: CreateUserDto): Promise<UserDto> {
    const user = await this.authService.createUser(body);

    const verificationToken =
      await this.emailVerificationTokenService.generateVerificationToken(
        user.id.toString()
      );

    const event: UserRegistrationInitiatedEvent = {
      email: user.email,
      name: user.name,
      userId: user.id.toString(),
      verificationToken,
      timestamp: new Date(),
      expirationMinutes: TOKEN_CONFIG.EMAIL_VERIFICATION_TOKEN.MINUTES,
    };

    this.emailServiceClient.emitUserRegistrationInitiated(event);

    return user;
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
  async logout(@Body() body: RefreshTokenDto): Promise<LogoutResponseDto> {
    await this.authService.revokeRefreshToken(body.refreshToken);

    return {
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout from all devices',
    description:
      'Logout a user from all devices. Requires valid access token and proper authorization to perform this action on the target user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out from all devices successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to logout this user',
  })
  @ApiResponse({
    status: 404,
    description: 'Target user not found',
  })
  async logoutAll(
    @Body() body: LogoutAllRequestDto
  ): Promise<LogoutAllResponseDto> {
    return await this.authService.logoutAllDevices(
      body.accessToken,
      body.userId
    );
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
    @Body() body: VerifyAccessTokenParamsDto
  ): Promise<VerifyTokenDto> {
    return this.authService.verifyToken(body.accessToken);
  }

  @Patch('user/soft-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft delete a user by ID',
    description:
      'This endpoint is intended for internal microservice use only. The consumer service is responsible for' +
      ' authenticating the user and providing the authenticated user context. Instead of permanently deleting, this marks the user as deleted.',
  })
  @ApiResponse({
    status: 200,
    description: 'User soft deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async softDeleteUser(
    @Body() body: DeleteUserParamsDto
  ): Promise<DeleteUserDto> {
    await this.userDeletionService.softDeleteUser(
      body.accessToken,
      body.targetUserId
    );

    return { message: 'User soft deleted successfully' };
  }

  @Delete('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Hard delete a user by ID',
    description:
      'This endpoint permanently deletes the user and all related data from the database. Only allowed for users with sufficient permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'User hard deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async hardDeleteUser(
    @Body() body: DeleteUserParamsDto
  ): Promise<DeleteUserDto> {
    return this.userDeletionService.hardDeleteUser(
      body.accessToken,
      body.targetUserId
    );
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email with token sent to email',
    description:
      'This endpoint verifies the user email using the token sent to their email address during registration. ' +
      'The token is valid for a limited time and can only be used once.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: VerifyEmailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token, or email already verified',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyEmail(
    @Query() params: VerifyEmailQueryDto
  ): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(params.token);
  }
}
