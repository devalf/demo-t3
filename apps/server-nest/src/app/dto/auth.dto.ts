import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiAuthSignInParams, ApiCreateUserParams } from '@demo-t3/models';

export class CreateUserDto implements ApiCreateUserParams {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ required: false })
  name?: string;
}

export class AuthSignInDto implements ApiAuthSignInParams {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
