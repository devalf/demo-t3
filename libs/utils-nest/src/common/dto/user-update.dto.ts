import { ApiUpdateUserParams } from '@demo-t3/models';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto implements ApiUpdateUserParams {
  @ApiProperty({ description: 'ID of the user to be updated' })
  @IsInt()
  @IsNotEmpty()
  targetUserId: number;

  @ApiProperty({
    description: 'Access token of the requesting user (admin only)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(45)
  email?: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
