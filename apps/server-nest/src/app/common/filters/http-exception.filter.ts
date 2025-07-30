import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private readonly errorPatterns = {
    [HttpStatus.UNAUTHORIZED]: [
      'invalid credentials',
      'unauthorized',
      'invalid token',
      'token not found',
      'invalid refresh token',
      'refresh token not found',
      'authentication failed',
      'access denied',
    ],
    [HttpStatus.NOT_FOUND]: [
      'not found',
      'user not found',
      'resource not found',
      'does not exist',
    ],
    [HttpStatus.CONFLICT]: [
      'already exists',
      'duplicate',
      'conflict',
      'user with this email already exists',
    ],
    [HttpStatus.BAD_REQUEST]: [
      'validation failed',
      'invalid input',
      'bad request',
      'missing required',
      'invalid format',
    ],
  };

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.getErrorDetails(exception);

    this.logger.error(`HTTP ${status} Error: ${message}`, {
      path: request.url,
      method: request.method,
      statusCode: status,
      timestamp: new Date().toISOString(),
      exception: exception instanceof Error ? exception.stack : exception,
    });

    response.status(status).json({
      statusCode: status,
      message,
    });
  }

  private getErrorDetails(exception: unknown): {
    status: number;
    message: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string })?.message ||
            exception.message;

      return { status, message };
    }

    if (exception instanceof Error) {
      const errorMessage = exception.message;
      const status = this.getStatusFromMessage(errorMessage);
      return {
        status,
        message:
          status === HttpStatus.INTERNAL_SERVER_ERROR
            ? 'Internal server error'
            : errorMessage,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private getStatusFromMessage(message: string): number {
    const lowerMessage = message.toLowerCase();

    for (const [status, patterns] of Object.entries(this.errorPatterns)) {
      if (
        patterns.some((pattern) => lowerMessage.includes(pattern.toLowerCase()))
      ) {
        return Number(status);
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
