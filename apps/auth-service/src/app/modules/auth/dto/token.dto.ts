import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @IsString()
  @ApiProperty()
  token: string;
}
