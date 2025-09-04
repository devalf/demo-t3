import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

import { AppLoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    const user = (request as any).user;
    const userId = user?.id || user?.userId;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logger.logRequest({
            method,
            url,
            statusCode: response.statusCode,
            responseTime,
            userId,
            userAgent,
            ip,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.logRequest({
            method,
            url,
            statusCode: response.statusCode || 500,
            responseTime,
            userId,
            userAgent,
            ip,
          });

          this.logger.error('Request failed', error.stack, 'HTTP');
        },
      })
    );
  }
}
