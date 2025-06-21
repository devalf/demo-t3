import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApiAuthSignInParams, ApiCreateUserParams } from '@demo-t3/models';

export class CreateUserDto implements ApiCreateUserParams {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Strong password with minimum requirements',
    example: 'SecurePassword123!',
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class DeviceInfoDto {
  @ApiProperty({
    description: 'User agent string from the client browser/app',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    description: 'Client IP address',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ip?: string;
}

export class AuthSignInDto implements ApiAuthSignInParams {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description:
      'Optional device information for security tracking. If not provided, will be extracted from request headers.',
    type: DeviceInfoDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;
}

export class RefreshTokenWithDeviceDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({
    description: 'Device information for security tracking',
    type: DeviceInfoDto,
  })
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo: DeviceInfoDto;
}
