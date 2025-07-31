import {
  IsEmail,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApiAuthSignInParams, ApiDeviceInfo } from '@demo-t3/models';

import { IsNotDangerous, Sanitize } from '../../../common/decorators';

type DeviceInfoOptionalParams = Partial<ApiDeviceInfo>;

export class DeviceInfoDto implements DeviceInfoOptionalParams {
  @ApiProperty({
    description: 'User agent string from the client browser/app',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'User agent must not exceed 1000 characters' })
  @IsNotDangerous({
    message: 'User agent contains potentially dangerous content',
  })
  @Sanitize()
  userAgent?: string;

  @ApiProperty({
    description: 'Client IP address',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsIP(undefined, { message: 'Invalid IP address format' })
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
