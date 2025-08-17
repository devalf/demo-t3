import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { OrderModule } from './modules/order/order.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { THROTTLER_CONFIG } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: THROTTLER_CONFIG.DEFAULT.TTL_MILLISECONDS,
          limit: THROTTLER_CONFIG.DEFAULT.LIMIT,
        },
      ],
    }),
    DatabaseModule,
    ProductsModule,
    OrderModule,
    AuthModule,
    UserModule,
    HealthCheckModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
