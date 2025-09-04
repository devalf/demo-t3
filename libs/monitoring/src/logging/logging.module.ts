import { DynamicModule, Global, Module } from '@nestjs/common';
import { WinstonModule, WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { AppLoggingService } from './logging.service';
import { LoggingInterceptor } from './logging.interceptor';
import { createWinstonConfig } from './winston-config';

@Global()
@Module({})
export class AppLoggingModule {
  static forRoot(serviceName?: string): DynamicModule {
    return {
      module: AppLoggingModule,
      imports: [
        WinstonModule.forRoot(
          createWinstonConfig(
            serviceName || process.env['SERVICE_NAME'] || 'unknown'
          )
        ),
      ],
      providers: [
        {
          provide: AppLoggingService,
          useFactory: (logger) => new AppLoggingService(logger),
          inject: [WINSTON_MODULE_PROVIDER],
        },
        LoggingInterceptor,
      ],
      exports: [AppLoggingService, LoggingInterceptor],
    };
  }
}
