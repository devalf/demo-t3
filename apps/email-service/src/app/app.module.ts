import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  AppLoggingModule,
  LoggingInterceptor,
  MetricsInterceptor,
  MetricsModule,
} from '@demo-t3/monitoring';
import { HealthCheckModule } from '@demo-t3/utils-nest';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppLoggingModule.forRoot(),
    MetricsModule,
    HealthCheckModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
