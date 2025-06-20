import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { PrismaClientKnownRequestError } from '../../../prisma-setup/generated/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists';

        if (exception.meta?.target) {
          const field = Array.isArray(exception.meta.target)
            ? exception.meta.target[0]
            : exception.meta.target;
          message = `${field} already exists`;
        }
        break;

      case 'P2025':
        // Record not found - this is expected behavior, log as debug/warn instead of error
        status = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
        this.logger.debug(`Resource not found: ${exception.message}`);
        break;

      case 'P2003':
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference to related resource';
        this.logger.warn(
          `Foreign key constraint violation: ${exception.message}`
        );
        break;

      case 'P2014':
        // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Cannot delete resource due to related dependencies';
        this.logger.warn(`Relation constraint violation: ${exception.message}`);
        break;

      default:
        // Only log actual errors, not expected business logic failures
        this.logger.error(
          `Unhandled Prisma error: ${exception.code}`,
          exception.message
        );
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
