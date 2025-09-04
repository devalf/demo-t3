import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLoggingService implements LoggerService {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  logRequest(data: {
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    userId?: string;
    userAgent?: string;
    ip?: string;
  }) {
    this.logger.info('HTTP Request', {
      context: 'HTTP',
      event: 'request_completed',
      ...data,
    });
  }

  logAuth(data: {
    event: 'login' | 'logout' | 'token_refresh' | 'login_failed';
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    error?: string;
  }) {
    this.logger.info('Auth Event', {
      context: 'Auth',
      ...data,
    });
  }

  logDatabase(data: {
    operation: string;
    table?: string;
    duration: number;
    error?: string;
  }) {
    if (data.error) {
      this.logger.error('Database Operation Failed', {
        context: 'Database',
        ...data,
      });
    } else {
      this.logger.debug('Database Operation', {
        context: 'Database',
        ...data,
      });
    }
  }

  logBusinessEvent(data: {
    event: string;
    userId?: string;
    metadata?: Record<string, any>;
  }) {
    this.logger.info('Business Event', {
      context: 'Business',
      ...data,
    });
  }
}
