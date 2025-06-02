import { IsEmail, IsNumber, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiAuthParams, ApiSignUpResponse, ApiUser } from '@demo-t3/models';

// TODO separate each class to the single file

export class TokenDto {
  @IsString()
  @ApiProperty()
  token: string;
}

export class UserDto implements ApiUser {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  name?: string;

  password: string;

  @IsString()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  role: string;

  createdAt: string;
  updatedAt: string;
}

export class SignUpResponseDto extends TokenDto implements ApiSignUpResponse {
  @ApiProperty({ type: UserDto })
  user: UserDto;
}

export class AuthParamsDto implements ApiAuthParams {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
