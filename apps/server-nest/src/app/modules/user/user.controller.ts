import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AccessTokenGuard } from '../../common/guards';

@ApiTags('User data TBD')
@Controller('user')
export class UserController {
  @UseGuards(AccessTokenGuard)
  @Get()
  getUser() {
    return { message: 'OK' };
  }
}
