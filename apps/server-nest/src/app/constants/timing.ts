const { NX_PUBLIC_MODE, NX_PUBLIC_ENABLE_RATE_LIMITS } = process.env;

const isProduction = NX_PUBLIC_MODE === 'production';
const isRateLimitingEnabled =
  isProduction || NX_PUBLIC_ENABLE_RATE_LIMITS === 'true';

export const THROTTLER_CONFIG = {
  DEFAULT: {
    TTL_MILLISECONDS: 60000,
    LIMIT: isRateLimitingEnabled ? 300 : 10000,
  },
  STRICT: {
    TTL_MILLISECONDS: 60000,
    LIMIT: isRateLimitingEnabled ? 10 : 10000,
  },
  RIGID: {
    TTL_MILLISECONDS: 60000,
    LIMIT: isRateLimitingEnabled ? 3 : 10000,
  },
} as const;
