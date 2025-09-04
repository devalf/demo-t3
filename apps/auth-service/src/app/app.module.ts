import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  MetricsInterceptor,
  MetricsModule,
  AppLoggingModule,
  LoggingInterceptor,
} from '@demo-t3/monitoring';

import { AuthModule } from './modules/auth/auth.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { TOKEN_CONFIG } from './constants';
import { PrismaExceptionFilter } from './common/filters';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('NX_PUBLIC_JWT_SECRET'),
        signOptions: { expiresIn: TOKEN_CONFIG.ACCESS_TOKEN.JWT_EXPIRY },
      }),
    }),
    AuthModule,
    HealthCheckModule,
    MetricsModule,
    AppLoggingModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
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
