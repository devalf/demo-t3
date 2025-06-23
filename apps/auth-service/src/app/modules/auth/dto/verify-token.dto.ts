import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiAccessToken, ApiVerifyToken } from '@demo-t3/models';

export class VerifyAccessTokenParamsDto implements ApiAccessToken {
  @ApiProperty({
    description: 'accessToken token to verify',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}

export class VerifyTokenDto implements ApiVerifyToken {
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'User payload if token is valid',
    example: {
      id: 1,
      email: 'user@example.com',
      role: 'USER',
    },
    required: false,
  })
  payload?: Record<string, unknown>;

  @ApiProperty({
    description: 'Error message if token is invalid',
    example: 'Token expired',
    required: false,
  })
  error?: string;
}
