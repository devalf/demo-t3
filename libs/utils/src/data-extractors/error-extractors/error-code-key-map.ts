import { ERROR_CODE_MESSAGES } from '@demo-t3/models';

/**
 * Maps error codes to translation keys or user-friendly messages
 * This is a re-export of ERROR_CODE_MESSAGES from @demo-t3/models
 * with support for HTTP status codes as fallback keys
 *
 * @deprecated Import ERROR_CODE_MESSAGES directly from @demo-t3/models instead
 */
export const errorCodeKeyMap: Record<string, string> = {
  // HTTP status code fallbacks
  '400': 'Bad request',
  '401': 'Unauthorized access',
  '403': 'Access forbidden',
  '404': 'Resource not found',
  '409': 'Conflict with existing resource',
  '422': 'Validation failed',
  '429': 'Too many requests',
  '500': 'Internal server error',
  '502': 'Bad gateway',
  '503': 'Service unavailable',

  // Application error codes (mapped from ERROR_CODE_MESSAGES)
  ...Object.fromEntries(
    Object.entries(ERROR_CODE_MESSAGES).map(([code, message]) => [
      code,
      message,
    ])
  ),
};
