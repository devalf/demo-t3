import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailQueryDto {
  @ApiProperty({
    description: 'Email verification token sent to user email',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  token: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Email verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User email that was verified',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Timestamp of verification',
    example: '2025-10-16T12:00:00.000Z',
  })
  verifiedAt: string;
}
