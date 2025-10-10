import { Module, Global } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';

import { RedisClient } from './redis.client';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>(
          'NX_PUBLIC_REDIS_HOST',
          'localhost'
        );
        const port = configService.get<number>('NX_PUBLIC_REDIS_PORT', 6379);

        return new Redis({ host, port });
      },
      inject: [ConfigService],
    },
    RedisClient,
  ],
  exports: ['REDIS_CLIENT', RedisClient],
})
export class RedisModule {}
