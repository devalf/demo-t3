import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  AuthSignInDto,
  CreateUserDto,
  TokenDto,
  UserDto,
  VerifyTokenDto,
  VerifyTokenParamsDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserDto,
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
    type: TokenDto,
  })
  async signIn(@Body() authParams: AuthSignInDto): Promise<TokenDto> {
    return this.authService.signIn(authParams);
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
}
