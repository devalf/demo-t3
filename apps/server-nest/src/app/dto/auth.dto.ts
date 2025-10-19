import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  ApiAccessTokenExpiresIn,
  ApiAuthSignInParams,
  ApiCreateUserParams,
  ApiVerifyEmailParams,
} from '@demo-t3/models';
import { UpdateUserDto as BaseUpdateUserDto } from '@demo-t3/utils-nest';

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

export class VerifyEmailParamsDto implements ApiVerifyEmailParams {
  @ApiProperty({
    description: 'Email verification token sent to user email',
    example: 'abc123asdf...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class UpdateUserDto extends OmitType(BaseUpdateUserDto, [
  'accessToken',
] as const) {}
