import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards';

@ApiTags('User data TBD')
@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getUser() {
    return { message: 'OK' };
  }
}
