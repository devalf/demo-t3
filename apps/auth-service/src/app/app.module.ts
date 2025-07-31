import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
