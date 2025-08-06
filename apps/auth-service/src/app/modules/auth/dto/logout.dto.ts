import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { ApiLogoutAllResponse, ApiLogoutResponse } from '@demo-t3/models';

import { VerifyAccessTokenParamsDto } from './verify-token.dto';

class LogoutAllParamsDto {
  @ApiProperty({ description: 'User ID to logout', example: 1 })
  @IsNumber()
  userId: number;
}

export class LogoutAllRequestDto extends IntersectionType(
  VerifyAccessTokenParamsDto,
  LogoutAllParamsDto
) {}

export class LogoutResponseDto implements ApiLogoutResponse {
  @ApiProperty({ example: 'Logged out successfully' })
  message: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}

export class LogoutAllResponseDto implements ApiLogoutAllResponse {
  @ApiProperty({ example: 'Logged out from all devices successfully' })
  message: string;

  @ApiProperty({ example: 5 })
  devicesLoggedOut?: number;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}
