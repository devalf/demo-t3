import { randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';
import { RedisClient } from '@demo-t3/utils-nest';

import { TOKEN_CONFIG } from '../../../constants';

@Injectable()
export class EmailVerificationTokenService {
  private readonly TOKEN_PREFIX =
    TOKEN_CONFIG.EMAIL_VERIFICATION_TOKEN.TOKEN_PREFIX;
  private readonly TOKEN_TTL = TOKEN_CONFIG.EMAIL_VERIFICATION_TOKEN.SECONDS;

  constructor(private readonly redis: RedisClient) {}

  async generateVerificationToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const key = `${this.TOKEN_PREFIX}${token}`;

    await this.redis.setex(key, this.TOKEN_TTL, userId);

    return token;
  }

  async verifyToken(token: string): Promise<string | null> {
    const key = `${this.TOKEN_PREFIX}${token}`;
    const userId = await this.redis.get(key);

    return userId;
  }

  async invalidateToken(token: string): Promise<void> {
    const key = `${this.TOKEN_PREFIX}${token}`;

    await this.redis.del(key);
  }

  async getTokenTTL(token: string): Promise<number> {
    const key = `${this.TOKEN_PREFIX}${token}`;

    return this.redis.ttl(key);
  }
}
