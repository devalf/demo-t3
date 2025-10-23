import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ErrorCode } from '@demo-t3/models';

@Injectable()
export class CsrfGuard implements CanActivate {
  private static readonly SKIP_CSRF_KEY = 'skipCsrf';
  private static readonly MAX_TOKEN_LENGTH = 64; // the value with extra space for possible adjustments
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(private readonly reflector: Reflector) {}

  static Skip() {
    return (
      target: unknown,
      propertyKey?: string,
      descriptor?: PropertyDescriptor
    ) => {
      const Reflect = global.Reflect;

      if (propertyKey) {
        Reflect.defineMetadata(CsrfGuard.SKIP_CSRF_KEY, true, descriptor.value);
      } else {
        Reflect.defineMetadata(CsrfGuard.SKIP_CSRF_KEY, true, target);
      }
    };
  }

  canActivate(context: ExecutionContext): boolean {
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(
      CsrfGuard.SKIP_CSRF_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (skipCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return true;
    }

    const csrfCookie = request.cookies?.['csrfToken'];
    const csrfHeader = request.headers['x-csrf-token'];

    if (!csrfCookie || !csrfHeader) {
      this.logger.warn('CSRF validation failed: token missing', {
        hasCookie: !!csrfCookie,
        hasHeader: !!csrfHeader,
        ip: request.ip,
        path: request.path,
        method: request.method,
      });
      throw new ForbiddenException(ErrorCode.CSRF_TOKEN_MISSING);
    }

    if (!this.timingSafeEqual(csrfCookie, csrfHeader as string)) {
      this.logger.warn('CSRF validation failed: token mismatch', {
        ip: request.ip,
        path: request.path,
        method: request.method,
      });
      throw new ForbiddenException(ErrorCode.CSRF_TOKEN_INVALID);
    }

    return true;
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private timingSafeEqual(a: string, b: string): boolean {
    // Prevent DoS attacks with extremely long tokens
    if (
      a.length > CsrfGuard.MAX_TOKEN_LENGTH ||
      b.length > CsrfGuard.MAX_TOKEN_LENGTH
    ) {
      return false;
    }

    if (a.length !== b.length) {
      return false;
    }

    let result = 0;

    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

/**
 * Decorator to skip CSRF validation on specific endpoints
 *
 * @example
 * @SkipCsrf()
 * @Post('webhook')
 * handleWebhook() { ... }
 */
export const SkipCsrf = CsrfGuard.Skip;
