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

  /**
   * Generate a verification token and store it in Redis with TTL
   * @param userId - User ID to associate with the token
   * @returns The generated verification token
   */
  async generateVerificationToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const key = `${this.TOKEN_PREFIX}${token}`;

    await this.redis.setex(key, this.TOKEN_TTL, userId);

    return token;
  }

  /**
   * Verify a token and get the associated userId
   * @param token - The verification token
   * @returns The userId if token is valid, null otherwise
   */
  async verifyToken(token: string): Promise<string | null> {
    const key = `${this.TOKEN_PREFIX}${token}`;
    const userId = await this.redis.get(key);

    return userId;
  }

  /**
   * Invalidate a verification token
   * @param token - The token to invalidate
   */
  async invalidateToken(token: string): Promise<void> {
    const key = `${this.TOKEN_PREFIX}${token}`;

    await this.redis.del(key);
  }

  /**
   * Get remaining TTL for a token
   * @param token - The verification token
   * @returns TTL in seconds, -1 if no expiry, -2 if doesn't exist
   */
  async getTokenTTL(token: string): Promise<number> {
    const key = `${this.TOKEN_PREFIX}${token}`;

    return this.redis.ttl(key);
  }
}
