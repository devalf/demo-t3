import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiUser } from '@demo-t3/models';
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
}
