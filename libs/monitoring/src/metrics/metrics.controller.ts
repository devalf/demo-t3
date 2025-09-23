import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { register as promRegister } from 'prom-client';
import {
  ApiExcludeController,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';

@ApiExcludeController() // excluded for now from the swagger doc
@ApiTags('Monitoring')
@Controller('metrics')
export class MetricsController {
  @Get()
  @ApiTags('Monitoring')
  @ApiOperation({ summary: 'Expose Prometheus metrics for scraping' })
  @ApiProduces('text/plain')
  @ApiOkResponse({
    description: 'Prometheus metrics in text/plain format',
    schema: { type: 'string' },
    content: {
      'text/plain': {
        schema: { type: 'string' },
      },
    },
  })
  async getMetrics(@Res() response: Response) {
    const metrics = await promRegister.metrics();

    response.set('Content-Type', promRegister.contentType);
    response.end(metrics);
  }
}
