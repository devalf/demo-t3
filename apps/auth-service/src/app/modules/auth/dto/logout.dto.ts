import { ApiProperty } from '@nestjs/swagger';
import { ApiLogoutAllResponse, ApiLogoutResponse } from '@demo-t3/models';
import { IsNumber } from 'class-validator';

export class LogoutAllRequestDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNumber()
  userId: number;
}

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
