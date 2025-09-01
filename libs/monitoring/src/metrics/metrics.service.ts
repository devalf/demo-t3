import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    public readonly httpRequestsTotal: Counter<string>,

    @InjectMetric('http_request_duration_seconds')
    public readonly httpRequestDuration: Histogram<string>,

    @InjectMetric('active_connections')
    public readonly activeConnections: Gauge<string>,

    @InjectMetric('business_operations_total')
    public readonly businessOperationsTotal: Counter<string>
  ) {}

  incrementHttpRequests(method: string, route: string, statusCode: string) {
    this.httpRequestsTotal.inc({
      method,
      route,
      status: statusCode,
    });
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe(
      {
        method,
        route,
      },
      duration
    );
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  incrementBusinessOperation(operation: string, status: 'success' | 'error') {
    this.businessOperationsTotal.inc({
      operation,
      status,
    });
  }
}
