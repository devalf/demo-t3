import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { register as promRegister } from 'prom-client';

@Controller()
export class MetricsController {
  @Get('metrics')
  async getMetrics(@Res() response: Response) {
    const metrics = await promRegister.metrics();

    response.set('Content-Type', promRegister.contentType);
    response.end(metrics);
  }
}
