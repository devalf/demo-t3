import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import {
  ERROR_CODE_MESSAGES,
  ERROR_CODE_TO_HTTP_STATUS,
  ErrorCode,
} from '@demo-t3/models';
import { Response } from 'express';

import { PrismaClientKnownRequestError } from '../../../prisma-setup/generated/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let errorCode: ErrorCode;
    let message: string;

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        errorCode = ErrorCode.ALREADY_EXISTS;
        message = ERROR_CODE_MESSAGES[ErrorCode.ALREADY_EXISTS];
        break;

      case 'P2025':
        // Record not found - this is expected behavior, log as debug/warn instead of error
        errorCode = ErrorCode.NOT_FOUND;
        message = ERROR_CODE_MESSAGES[ErrorCode.NOT_FOUND];
        this.logger.debug(`Resource not found: ${exception.message}`);
        break;

      case 'P2003':
        // Foreign key constraint violation
        errorCode = ErrorCode.INVALID_INPUT;
        message = 'Invalid reference to related resource';
        this.logger.warn(
          `Foreign key constraint violation: ${exception.message}`
        );
        break;

      case 'P2014':
        // Required relation violation
        errorCode = ErrorCode.CONFLICT;
        message = 'Cannot delete resource due to related dependencies';
        this.logger.warn(`Relation constraint violation: ${exception.message}`);
        break;

      default:
        // Only log actual errors, not expected business logic failures
        errorCode = ErrorCode.DATABASE_ERROR;
        message = ERROR_CODE_MESSAGES[ErrorCode.DATABASE_ERROR];

        this.logger.error(
          `Unhandled Prisma error: ${exception.code}`,
          exception.message
        );
        break;
    }

    const status = ERROR_CODE_TO_HTTP_STATUS[errorCode];

    response.status(status).json({
      statusCode: status,
      message,
      code: errorCode,
      error: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
