import { IsEmail, IsNumber, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ApiAccessTokenExpiresIn,
  ApiAuthSignInParams,
  ApiCreateUserParams,
} from '@demo-t3/models';

export class CreateUserDto implements ApiCreateUserParams {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}

export class AuthSignInDto implements ApiAuthSignInParams {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}

export class AccessTokenExpiresInDto implements ApiAccessTokenExpiresIn {
  @ApiProperty()
  @IsNumber()
  accessTokenExpiresIn: number;
}
