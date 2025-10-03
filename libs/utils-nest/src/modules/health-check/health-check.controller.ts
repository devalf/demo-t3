import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { HealthCheckDto } from './dto';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  @Get()
  @ApiOkResponse({ type: HealthCheckDto })
  healthCheck(): HealthCheckDto {
    return { status: 'ok' };
  }
}
