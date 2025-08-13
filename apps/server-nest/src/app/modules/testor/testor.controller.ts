import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AccessTokenGuard } from '../../common/guards';

@ApiTags('For testing purposes')
@Controller('testor')
export class TestorController {
  @UseGuards(AccessTokenGuard)
  @Get()
  getTestor() {
    return { message: 'OK' };
  }
}
