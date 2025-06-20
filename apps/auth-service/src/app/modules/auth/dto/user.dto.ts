import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ApiDeleteUserParams,
  ApiMessagePayload,
  ApiUser,
} from '@demo-t3/models';
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
  @IsString()
  @ApiProperty()
  role: string;

  createdAt: string;
  updatedAt: string;
  password: string;
  settings: string;
}

export class DeleteUserParamsDto implements ApiDeleteUserParams {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNumber()
  id: number;
}

export class DeleteUserDto implements ApiMessagePayload {
  @ApiProperty({
    description: 'Successful user deletion',
    example: 'User deleted successfully',
  })
  message: string;
}
