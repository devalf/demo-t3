import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiAuthTokens, ApiRefreshTokenObject } from '@demo-t3/models';

export class RefreshTokenDto implements ApiRefreshTokenObject {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIs...',
    description: 'JWT refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AuthTokensDto implements ApiAuthTokens {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for getting new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration in seconds',
    example: 900,
  })
  expiresIn: number;
}
