import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApiHealthCheck } from '@demo-t3/models';

@Exclude()
export class HealthCheckDto implements ApiHealthCheck {
  @Expose()
  @ApiProperty({ example: 'ok', description: 'Health status of the service' })
  status: string;
}
