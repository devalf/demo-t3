import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ERROR_CODE_TO_HTTP_STATUS, ErrorCode } from '@demo-t3/models';
import { HttpExceptionFilter as BaseHttpExceptionFilter } from '@demo-t3/utils-nest';

/**
 * Extended HTTP Exception Filter for server-nest
 *
 * This filter extends the shared HttpExceptionFilter from @demo-t3/utils-nest
 * and adds legacy message inference support for backwards compatibility.
 *
 * Legacy support: For Error objects with string messages (not ErrorCode enum),
 * this filter attempts to infer the appropriate ErrorCode based on message content.
 *
 * TODO: Remove legacy inference logic once all error handling is migrated to use ErrorCode enum
 */
@Catch()
export class HttpExceptionFilter extends BaseHttpExceptionFilter {
  /**
   * Override catch to add legacy message inference before delegating to parent
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // For standard Error objects (not HttpException), try to infer error code
    // and convert to HttpException for proper handling
    if (exception instanceof Error && !(exception instanceof HttpException)) {
      const inferredCode = this.inferErrorCodeFromMessage(exception.message);

      if (inferredCode) {
        // Convert to HttpException with the inferred error code
        const status = ERROR_CODE_TO_HTTP_STATUS[inferredCode];
        const httpException = new HttpException(inferredCode, status);

        // Delegate to parent with the converted exception
        return super.catch(httpException, host);
      }
    }

    // For all other cases, delegate to parent
    super.catch(exception, host);
  }

  /**
   * Infer error code from error message for backwards compatibility
   * This allows gradual migration from string-based to code-based errors
   *
   * // TODO remove it later, all error catches should be based only on `ErrorCode` enum
   */
  private inferErrorCodeFromMessage(message: string): ErrorCode | undefined {
    const lowerMessage = message.toLowerCase();

    // Authentication errors
    if (
      lowerMessage.includes('invalid credentials') ||
      lowerMessage.includes('invalid email or password')
    ) {
      return ErrorCode.INVALID_CREDENTIALS;
    }

    if (
      lowerMessage.includes('invalid token') ||
      lowerMessage.includes('token expired') ||
      lowerMessage.includes('session expired')
    ) {
      return ErrorCode.INVALID_TOKEN;
    }

    if (
      lowerMessage.includes('invalid refresh token') ||
      lowerMessage.includes('refresh token not found')
    ) {
      return ErrorCode.REFRESH_TOKEN_INVALID;
    }

    if (
      lowerMessage.includes('authentication failed') ||
      lowerMessage.includes('unauthorized')
    ) {
      return ErrorCode.AUTHENTICATION_FAILED;
    }

    // Authorization errors
    if (
      lowerMessage.includes('access denied') ||
      lowerMessage.includes('permission denied') ||
      lowerMessage.includes('insufficient permission')
    ) {
      return ErrorCode.PERMISSION_DENIED;
    }

    if (lowerMessage.includes('forbidden')) {
      return ErrorCode.FORBIDDEN;
    }

    // Email verification errors
    if (
      lowerMessage.includes('verify your email') ||
      lowerMessage.includes('email not verified')
    ) {
      return ErrorCode.EMAIL_NOT_VERIFIED;
    }

    // Resource errors
    if (lowerMessage.includes('user not found')) {
      return ErrorCode.USER_NOT_FOUND;
    }

    if (
      lowerMessage.includes('not found') ||
      lowerMessage.includes('does not exist')
    ) {
      return ErrorCode.NOT_FOUND;
    }

    // Conflict errors
    if (lowerMessage.includes('user with this email already exists')) {
      return ErrorCode.EMAIL_ALREADY_EXISTS;
    }

    if (
      lowerMessage.includes('already exists') ||
      lowerMessage.includes('duplicate')
    ) {
      return ErrorCode.ALREADY_EXISTS;
    }

    if (lowerMessage.includes('conflict')) {
      return ErrorCode.CONFLICT;
    }

    // Validation errors
    if (
      lowerMessage.includes('validation failed') ||
      lowerMessage.includes('invalid input')
    ) {
      return ErrorCode.VALIDATION_FAILED;
    }

    if (
      lowerMessage.includes('bad request') ||
      lowerMessage.includes('missing required') ||
      lowerMessage.includes('invalid format')
    ) {
      return ErrorCode.BAD_REQUEST;
    }

    return undefined;
  }

  private getStatusFromErrorCode(code: ErrorCode): HttpStatus {
    // Map based on error code prefix or specific codes
    switch (code) {
      // 401 errors
      case ErrorCode.INVALID_CREDENTIALS:
      case ErrorCode.INVALID_TOKEN:
      case ErrorCode.TOKEN_EXPIRED:
      case ErrorCode.TOKEN_NOT_FOUND:
      case ErrorCode.REFRESH_TOKEN_INVALID:
      case ErrorCode.REFRESH_TOKEN_NOT_FOUND:
      case ErrorCode.AUTHENTICATION_FAILED:
      case ErrorCode.SESSION_EXPIRED:
      case ErrorCode.UNAUTHORIZED:
        return HttpStatus.UNAUTHORIZED;

      // 403 errors
      case ErrorCode.FORBIDDEN:
      case ErrorCode.ACCESS_DENIED:
      case ErrorCode.PERMISSION_DENIED:
      case ErrorCode.INSUFFICIENT_PERMISSIONS:
      case ErrorCode.EMAIL_NOT_VERIFIED:
      case ErrorCode.EMAIL_VERIFICATION_REQUIRED:
      case ErrorCode.CSRF_TOKEN_MISSING:
      case ErrorCode.CSRF_TOKEN_INVALID:
        return HttpStatus.FORBIDDEN;

      // 404 errors
      case ErrorCode.NOT_FOUND:
      case ErrorCode.USER_NOT_FOUND:
      case ErrorCode.RESOURCE_NOT_FOUND:
        return HttpStatus.NOT_FOUND;

      // 409 errors
      case ErrorCode.ALREADY_EXISTS:
      case ErrorCode.EMAIL_ALREADY_EXISTS:
      case ErrorCode.USER_ALREADY_EXISTS:
      case ErrorCode.DUPLICATE_ENTRY:
      case ErrorCode.CONFLICT:
        return HttpStatus.CONFLICT;

      // 400 errors
      case ErrorCode.VALIDATION_FAILED:
      case ErrorCode.INVALID_INPUT:
      case ErrorCode.BAD_REQUEST:
      case ErrorCode.MISSING_REQUIRED_FIELD:
      case ErrorCode.INVALID_FORMAT:
      case ErrorCode.INVALID_EMAIL:
      case ErrorCode.INVALID_PASSWORD:
      case ErrorCode.VERIFICATION_TOKEN_INVALID:
      case ErrorCode.VERIFICATION_TOKEN_EXPIRED:
        return HttpStatus.BAD_REQUEST;

      // 429 errors
      case ErrorCode.RATE_LIMIT_EXCEEDED:
      case ErrorCode.TOO_MANY_REQUESTS:
        return HttpStatus.TOO_MANY_REQUESTS;

      // 503 errors
      case ErrorCode.SERVICE_UNAVAILABLE:
        return HttpStatus.SERVICE_UNAVAILABLE;

      // 502 errors
      case ErrorCode.EXTERNAL_SERVICE_ERROR:
        return HttpStatus.BAD_GATEWAY;

      // 500 errors (default)
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
