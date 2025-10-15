import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApiAccessTokenExpiresIn,
  ApiAuthSignInParams,
  ApiCreateUserParams,
  ApiVerifyEmailParams,
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

export class VerifyEmailParamsDto implements ApiVerifyEmailParams {
  @ApiProperty({
    description: 'Email verification token sent to user email',
    example: 'abc123asdf...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({
    description:
      'Optional full URL to redirect user after successful verification (must include protocol)',
    example: 'http://localhost:8082/',
  })
  @Matches(/^https?:\/\/.+/, {
    message: 'returnTo must be a valid URL starting with http:// or https://',
  })
  @IsOptional()
  returnTo?: string;
}
