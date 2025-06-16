import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards';

@ApiTags('For testing purposes')
@Controller('testor')
export class TestorController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getTestor() {
    return { message: 'OK' };
  }
}
