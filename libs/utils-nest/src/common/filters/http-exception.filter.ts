import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ERROR_CODE_MESSAGES,
  ERROR_CODE_TO_HTTP_STATUS,
  ErrorCode,
} from '@demo-t3/models';

type ErrorResponse = {
  statusCode: number;
  message: string;
  errorCode?: ErrorCode;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.getErrorResponse(exception);

    if (errorResponse.statusCode >= 500) {
      this.logger.error(`HTTP ${errorResponse.statusCode} Error`, {
        errorCode: errorResponse.errorCode,
        message: errorResponse.message,
        path: request.url,
        method: request.method,
        timestamp: errorResponse.timestamp,
        exception: exception instanceof Error ? exception.stack : exception,
      });
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private getErrorResponse(exception: unknown): ErrorResponse {
    const timestamp = new Date().toISOString();

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string })?.message ||
            exception.message;

      const errorCode = this.getErrorCodeFromMessage(message);
      const finalMessage = errorCode ? ERROR_CODE_MESSAGES[errorCode] : message;

      return {
        statusCode: status,
        message: finalMessage,
        errorCode,
        timestamp,
      };
    }

    // Handle standard Error objects
    if (exception instanceof Error) {
      const errorCode = this.getErrorCodeFromMessage(exception.message);
      const status = errorCode
        ? ERROR_CODE_TO_HTTP_STATUS[errorCode]
        : HttpStatus.INTERNAL_SERVER_ERROR;

      return {
        statusCode: status,
        message:
          status === HttpStatus.INTERNAL_SERVER_ERROR
            ? 'Internal server error'
            : errorCode
            ? ERROR_CODE_MESSAGES[errorCode]
            : exception.message,
        errorCode,
        timestamp,
      };
    }

    // Unknown exception type
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      timestamp,
    };
  }

  /**
   * Check if the message is a valid ErrorCode enum value
   */
  private getErrorCodeFromMessage(message: string): ErrorCode | undefined {
    if (Object.values(ErrorCode).includes(message as ErrorCode)) {
      return message as ErrorCode;
    }

    return undefined;
  }
}
