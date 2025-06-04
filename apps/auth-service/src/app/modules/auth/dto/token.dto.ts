import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiTokenObject } from '@demo-t3/models';

export class TokenDto implements ApiTokenObject {
  @IsString()
  @ApiProperty()
  token: string;
}
