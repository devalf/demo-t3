import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiUser } from '@demo-t3/models';
import { Exclude, Expose } from 'class-transformer';

/**
 * It's too dangerous to rely on the proper usage of this DTO, the safest approach to always use `Exclude` by default
 */
@Exclude()
export class UserProfileDto implements ApiUser {
  @Expose()
  @ApiProperty({
    description: 'User ID',
    example: 123,
  })
  @IsNumber()
  id: number;

  @Expose()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @Expose()
  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @ApiProperty({
    description: 'User role',
    enum: ['ADMIN', 'MANAGER', 'CLIENT'],
    example: 'CLIENT',
  })
  @IsString()
  role: string;

  @Expose()
  @ApiProperty({
    description: 'User settings as JSON object',
    example: { theme: 'dark', language: 'en' },
  })
  @IsObject()
  settings: Record<string, unknown>;

  @Expose()
  @ApiProperty({
    description: 'Whether the user email has been verified',
    example: true,
  })
  @IsBoolean()
  email_verified: boolean;
}
