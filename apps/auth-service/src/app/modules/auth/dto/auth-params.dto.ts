import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiAuthParams } from '@demo-t3/models';

export class AuthParamsDto implements ApiAuthParams {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ required: false })
  name?: string;
}
