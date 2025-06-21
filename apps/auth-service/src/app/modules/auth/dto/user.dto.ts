import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiMessagePayload, ApiUser } from '@demo-t3/models';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UserDto implements ApiUser {
  @Expose()
  @IsNumber()
  @ApiProperty()
  id: number;

  @Expose()
  @IsString()
  @ApiProperty({ required: false })
  @Transform(({ value }) => (value === null ? undefined : value), {
    toPlainOnly: true,
  })
  name?: string;

  @Expose()
  @IsString()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({
    description: 'Role of the user',
    enum: ['ADMIN', 'MANAGER', 'CLIENT'],
  })
  @IsEnum(['ADMIN', 'MANAGER', 'CLIENT'])
  role: string;

  deleted_at: string;
  createdAt: string;
  updatedAt: string;
  password: string;
  settings: string;
  is_active: boolean;
  original_email: string;
}

export class DeleteUserParamsDto {
  @ApiProperty({ description: 'ID of the user to be deleted' })
  @IsInt()
  @IsNotEmpty()
  targetUserId: number;

  @ApiProperty({
    description: 'Access token of the requesting user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export class DeleteUserDto implements ApiMessagePayload {
  @ApiProperty({
    description: 'Successful user deletion',
    example: 'User deleted successfully',
  })
  message: string;
}
