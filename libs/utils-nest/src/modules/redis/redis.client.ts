import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisClient {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async setex(key: string, seconds: number, value: string): Promise<string> {
    return this.client.setex(key, seconds, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // Expose the raw client for advanced operations if needed
  getRawClient(): Redis {
    return this.client;
  }
}
