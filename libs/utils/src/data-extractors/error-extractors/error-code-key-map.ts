/**
 * Maps error codes to translation keys or user-friendly messages
 * This can be extended to cover more specific error codes as needed
 *
 * - map of HTTP status codes and common error codes
 */
export const errorCodeKeyMap: Record<string, string> = {
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

  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'This email is already registered',
  INVALID_TOKEN: 'Your session has expired, please login again',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  VALIDATION_ERROR: 'Please check your input and try again',
  RATE_LIMIT_EXCEEDED: 'Too many attempts, please try again later',
  RESOURCE_NOT_FOUND: 'The requested resource could not be found',
  SERVER_ERROR: 'Something went wrong on our end, please try again later',
};
