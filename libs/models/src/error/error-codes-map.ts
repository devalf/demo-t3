/**
 * HTTP status codes
 * Replicate from @nestjs/common to avoid importing server dependencies in client
 */
export enum HttpStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Application error codes
 * These codes are used across frontend and backend for consistent error handling
 */
export enum ErrorCode {
  // Authentication errors (1xxx)
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_PAYLOAD_MISMATCH = 'TOKEN_PAYLOAD_MISMATCH',

  // Authorization errors (2xxx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Email verification errors (3xxx)
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  VERIFICATION_TOKEN_INVALID = 'VERIFICATION_TOKEN_INVALID',
  VERIFICATION_TOKEN_EXPIRED = 'VERIFICATION_TOKEN_EXPIRED',
  UNVERIFIED_ACCOUNT_EXISTS = 'UNVERIFIED_ACCOUNT_EXISTS',
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',

  // Resource errors (4xxx)
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
  USER_NOT_ACTIVE = 'USER_NOT_ACTIVE',
  USER_NO_LONGER_EXISTS = 'USER_NO_LONGER_EXISTS',
  INVALID_USER_ID = 'INVALID_USER_ID',

  // Conflict errors (5xxx)
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  CONFLICT = 'CONFLICT',

  // Validation errors (6xxx)
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  BAD_REQUEST = 'BAD_REQUEST',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',

  // Rate limiting (7xxx)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Security errors (8xxx)
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  CSRF_VALIDATION_FAILED = 'CSRF_VALIDATION_FAILED',

  // Server errors (9xxx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Maps error codes to HTTP status codes
 */
export const ERROR_CODE_TO_HTTP_STATUS: Record<ErrorCode, HttpStatus> = {
  // Authentication errors -> 401
  [ErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_NOT_FOUND]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.REFRESH_TOKEN_INVALID]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.REFRESH_TOKEN_NOT_FOUND]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.AUTHENTICATION_FAILED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.SESSION_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_PAYLOAD_MISMATCH]: HttpStatus.UNAUTHORIZED,

  // Authorization errors -> 403
  [ErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ErrorCode.ACCESS_DENIED]: HttpStatus.FORBIDDEN,
  [ErrorCode.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: HttpStatus.FORBIDDEN,

  // Email verification -> 403
  [ErrorCode.EMAIL_NOT_VERIFIED]: HttpStatus.FORBIDDEN,
  [ErrorCode.EMAIL_VERIFICATION_REQUIRED]: HttpStatus.FORBIDDEN,
  [ErrorCode.VERIFICATION_TOKEN_INVALID]: HttpStatus.BAD_REQUEST,
  [ErrorCode.VERIFICATION_TOKEN_EXPIRED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.UNVERIFIED_ACCOUNT_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.EMAIL_ALREADY_VERIFIED]: HttpStatus.BAD_REQUEST,

  // Resource errors -> 404
  [ErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.RESOURCE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.USER_UPDATE_FAILED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.USER_NOT_ACTIVE]: HttpStatus.FORBIDDEN,
  [ErrorCode.USER_NO_LONGER_EXISTS]: HttpStatus.FORBIDDEN,
  [ErrorCode.INVALID_USER_ID]: HttpStatus.BAD_REQUEST,

  // Conflict errors -> 409
  [ErrorCode.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.USER_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.DUPLICATE_ENTRY]: HttpStatus.CONFLICT,
  [ErrorCode.CONFLICT]: HttpStatus.CONFLICT,

  // Validation errors -> 400
  [ErrorCode.VALIDATION_FAILED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_INPUT]: HttpStatus.BAD_REQUEST,
  [ErrorCode.BAD_REQUEST]: HttpStatus.BAD_REQUEST,
  [ErrorCode.MISSING_REQUIRED_FIELD]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_FORMAT]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_EMAIL]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_PASSWORD]: HttpStatus.BAD_REQUEST,

  // Rate limiting -> 429
  [ErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
  [ErrorCode.TOO_MANY_REQUESTS]: HttpStatus.TOO_MANY_REQUESTS,

  // Security errors -> 403
  [ErrorCode.CSRF_TOKEN_MISSING]: HttpStatus.FORBIDDEN,
  [ErrorCode.CSRF_TOKEN_INVALID]: HttpStatus.FORBIDDEN,
  [ErrorCode.CSRF_VALIDATION_FAILED]: HttpStatus.FORBIDDEN,

  // Server errors -> 500
  [ErrorCode.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.DATABASE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: HttpStatus.BAD_GATEWAY,
};

/**
 * Maps error codes to user-friendly messages
 * These can be overridden with i18n translation keys
 */
export const ERROR_CODE_MESSAGES: Record<ErrorCode, string> = {
  // Authentication
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.INVALID_TOKEN]: 'Your session has expired, please login again',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired, please login again',
  [ErrorCode.TOKEN_NOT_FOUND]: 'Authentication token not found',
  [ErrorCode.REFRESH_TOKEN_INVALID]: 'Invalid refresh token',
  [ErrorCode.REFRESH_TOKEN_NOT_FOUND]: 'Refresh token not found',
  [ErrorCode.AUTHENTICATION_FAILED]: 'Authentication failed',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired, please login again',
  [ErrorCode.TOKEN_PAYLOAD_MISMATCH]:
    'Token payload does not match current user state',

  // Authorization
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.FORBIDDEN]: 'Access forbidden',
  [ErrorCode.ACCESS_DENIED]: 'Access denied',
  [ErrorCode.PERMISSION_DENIED]:
    'You do not have permission to perform this action',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',

  // Email verification
  [ErrorCode.EMAIL_NOT_VERIFIED]: 'Please verify your email address',
  [ErrorCode.EMAIL_VERIFICATION_REQUIRED]:
    'Email verification is required to continue',
  [ErrorCode.VERIFICATION_TOKEN_INVALID]: 'Invalid verification token',
  [ErrorCode.VERIFICATION_TOKEN_EXPIRED]:
    'Verification token has expired, please request a new one',
  [ErrorCode.UNVERIFIED_ACCOUNT_EXISTS]:
    'An unverified account with this email already exists. Please check your email for the verification link or wait for it to expire.',
  [ErrorCode.EMAIL_ALREADY_VERIFIED]: 'Email is already verified',

  // Resources
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested resource could not be found',
  [ErrorCode.USER_UPDATE_FAILED]: 'Failed to update user',
  [ErrorCode.USER_NOT_ACTIVE]: 'User account is not active',
  [ErrorCode.USER_NO_LONGER_EXISTS]: 'User no longer exists',
  [ErrorCode.INVALID_USER_ID]: 'Invalid user ID',

  // Conflicts
  [ErrorCode.ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 'This email is already registered',
  [ErrorCode.USER_ALREADY_EXISTS]: 'User already exists',
  [ErrorCode.DUPLICATE_ENTRY]: 'Duplicate entry',
  [ErrorCode.CONFLICT]: 'Conflict with existing resource',

  // Validation
  [ErrorCode.VALIDATION_FAILED]: 'Please check your input and try again',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCode.BAD_REQUEST]: 'Bad request',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Missing required field',
  [ErrorCode.INVALID_FORMAT]: 'Invalid format',
  [ErrorCode.INVALID_EMAIL]: 'Invalid email address',
  [ErrorCode.INVALID_PASSWORD]: 'Invalid password',

  // Rate limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many attempts, please try again later',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Too many requests, please try again later',

  // Security
  [ErrorCode.CSRF_TOKEN_MISSING]: 'Security validation failed',
  [ErrorCode.CSRF_TOKEN_INVALID]: 'Security validation failed',
  [ErrorCode.CSRF_VALIDATION_FAILED]: 'Security validation failed',

  // Server errors
  [ErrorCode.INTERNAL_SERVER_ERROR]:
    'Something went wrong on our end, please try again later',
  [ErrorCode.SERVER_ERROR]:
    'Something went wrong on our end, please try again later',
  [ErrorCode.SERVICE_UNAVAILABLE]:
    'Service temporarily unavailable, please try again later',
  [ErrorCode.DATABASE_ERROR]: 'Database error occurred',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
};
