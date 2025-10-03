import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  AppLoggingModule,
  LoggingInterceptor,
  MetricsInterceptor,
  MetricsModule,
} from '@demo-t3/monitoring';
import { HealthCheckModule } from '@demo-t3/utils-nest';

import { AuthModule } from './modules/auth/auth.module';
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
