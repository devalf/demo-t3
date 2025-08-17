const { NX_TASK_TARGET } = process.env;

const isTestEnvironment = NX_TASK_TARGET === 'e2e';

export const THROTTLER_CONFIG = {
  DEFAULT: {
    TTL_MILLISECONDS: 60000,
    LIMIT: isTestEnvironment ? 10000 : 300,
  },
  STRICT: {
    TTL_MILLISECONDS: 60000,
    LIMIT: isTestEnvironment ? 10000 : 10,
  },
  RIGID: {
    TTL_MILLISECONDS: 60000,
    LIMIT: isTestEnvironment ? 10000 : 3,
  },
} as const;
