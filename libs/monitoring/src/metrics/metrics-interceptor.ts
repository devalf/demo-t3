import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MetricsService } from './metrics.service';

const SECOND_IN_MS = 1000;

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const method = request.method;
    const route = request.route?.path || request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / SECOND_IN_MS;
          const statusCode = response.statusCode.toString();

          this.metricsService.incrementHttpRequests(method, route, statusCode);
          this.metricsService.observeHttpDuration(method, route, duration);
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / SECOND_IN_MS;
          const statusCode = error.status?.toString() || '500';

          this.metricsService.incrementHttpRequests(method, route, statusCode);
          this.metricsService.observeHttpDuration(method, route, duration);
        },
      })
    );
  }
}
