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

import { EmailModule } from './modules/email';
import { RegistrationModule } from './modules/registration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppLoggingModule.forRoot(),
    MetricsModule,
    HealthCheckModule,
    EmailModule,
    RegistrationModule,
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
