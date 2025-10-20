import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ErrorCode } from '@demo-t3/models';

import { CsrfGuard } from '../csrf.guard';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new CsrfGuard(reflector);

    // Default: no skip CSRF
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    mockRequest = {
      method: 'POST',
      cookies: {},
      headers: {},
      ip: '127.0.0.1',
      path: '/api/test',
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest as Request,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;
  });

  describe('canActivate', () => {
    describe('when @SkipCsrf decorator is applied', () => {
      it('should allow request without CSRF validation', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('for safe HTTP methods', () => {
      it('should allow GET requests without CSRF token', () => {
        mockRequest.method = 'GET';

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow HEAD requests without CSRF token', () => {
        mockRequest.method = 'HEAD';

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow OPTIONS requests without CSRF token', () => {
        mockRequest.method = 'OPTIONS';

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should handle lowercase method names', () => {
        mockRequest.method = 'get';

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('for state-changing HTTP methods', () => {
      it('should throw ForbiddenException when CSRF cookie is missing', () => {
        mockRequest.cookies = {};
        mockRequest.headers = { 'x-csrf-token': 'test-token' };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_MISSING)
        );
      });

      it('should throw ForbiddenException when CSRF header is missing', () => {
        mockRequest.cookies = { csrfToken: 'test-token' };
        mockRequest.headers = {};

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_MISSING)
        );
      });

      it('should throw ForbiddenException when both cookie and header are missing', () => {
        mockRequest.cookies = {};
        mockRequest.headers = {};

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_MISSING)
        );
      });

      it('should throw ForbiddenException when tokens do not match', () => {
        mockRequest.cookies = { csrfToken: 'token-from-cookie' };
        mockRequest.headers = { 'x-csrf-token': 'different-token' };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_INVALID)
        );
      });

      it('should allow request when tokens match', () => {
        const validToken = 'valid-csrf-token';
        mockRequest.cookies = { csrfToken: validToken };
        mockRequest.headers = { 'x-csrf-token': validToken };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should validate POST requests', () => {
        const validToken = 'valid-token';
        mockRequest.method = 'POST';
        mockRequest.cookies = { csrfToken: validToken };
        mockRequest.headers = { 'x-csrf-token': validToken };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should validate PUT requests', () => {
        const validToken = 'valid-token';
        mockRequest.method = 'PUT';
        mockRequest.cookies = { csrfToken: validToken };
        mockRequest.headers = { 'x-csrf-token': validToken };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should validate PATCH requests', () => {
        const validToken = 'valid-token';
        mockRequest.method = 'PATCH';
        mockRequest.cookies = { csrfToken: validToken };
        mockRequest.headers = { 'x-csrf-token': validToken };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should validate DELETE requests', () => {
        const validToken = 'valid-token';
        mockRequest.method = 'DELETE';
        mockRequest.cookies = { csrfToken: validToken };
        mockRequest.headers = { 'x-csrf-token': validToken };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('timing-safe comparison', () => {
      it('should handle valid base64 tokens with special characters', () => {
        const token = 'KhN+QQ2H0oqxEY/h/Ip9BFuQ2bzQQXT2hZgQLPv6HOw=';
        mockRequest.cookies = { csrfToken: token };
        mockRequest.headers = { 'x-csrf-token': token };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should reject tokens that differ by one character', () => {
        mockRequest.cookies = { csrfToken: 'abcdefgh12345678' };
        mockRequest.headers = { 'x-csrf-token': 'abcdefgh12345679' };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_INVALID)
        );
      });

      it('should reject tokens with different lengths', () => {
        mockRequest.cookies = { csrfToken: 'short-token' };
        mockRequest.headers = { 'x-csrf-token': 'much-longer-token-string' };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_INVALID)
        );
      });

      it('should be case-sensitive', () => {
        mockRequest.cookies = { csrfToken: 'CaseSensitiveToken' };
        mockRequest.headers = { 'x-csrf-token': 'casesensitivetoken' };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_INVALID)
        );
      });
    });

    describe('DoS protection', () => {
      it('should reject tokens exceeding maximum length in cookie', () => {
        const longToken = 'a'.repeat(65); // 65 chars, exceeds limit of 64
        const normalToken = 'valid-token';
        mockRequest.cookies = { csrfToken: longToken };
        mockRequest.headers = { 'x-csrf-token': normalToken };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_INVALID)
        );
      });

      it('should reject tokens exceeding maximum length in header', () => {
        const normalToken = 'valid-token';
        const longToken = 'a'.repeat(65); // 65 chars, exceeds limit of 64
        mockRequest.cookies = { csrfToken: normalToken };
        mockRequest.headers = { 'x-csrf-token': longToken };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_INVALID)
        );
      });

      it('should reject when both tokens exceed maximum length', () => {
        const longToken = 'a'.repeat(100);
        mockRequest.cookies = { csrfToken: longToken };
        mockRequest.headers = { 'x-csrf-token': longToken };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_INVALID)
        );
      });

      it('should accept tokens at maximum length limit', () => {
        const maxLengthToken = 'a'.repeat(64); // Exactly 64 chars
        mockRequest.cookies = { csrfToken: maxLengthToken };
        mockRequest.headers = { 'x-csrf-token': maxLengthToken };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should accept typical base64 tokens (44 chars)', () => {
        const typicalToken = 'a'.repeat(44);
        mockRequest.cookies = { csrfToken: typicalToken };
        mockRequest.headers = { 'x-csrf-token': typicalToken };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string tokens', () => {
        mockRequest.cookies = { csrfToken: '' };
        mockRequest.headers = { 'x-csrf-token': '' };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_MISSING)
        );
      });

      it('should handle whitespace-only tokens', () => {
        mockRequest.cookies = { csrfToken: '   ' };
        mockRequest.headers = { 'x-csrf-token': '   ' };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should handle tokens with unicode characters', () => {
        const unicodeToken = 'token-with-🔒-emoji';
        mockRequest.cookies = { csrfToken: unicodeToken };
        mockRequest.headers = { 'x-csrf-token': unicodeToken };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should handle undefined cookies object', () => {
        mockRequest.cookies = undefined;
        mockRequest.headers = { 'x-csrf-token': 'test-token' };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          new ForbiddenException(ErrorCode.CSRF_TOKEN_MISSING)
        );
      });
    });
  });

  describe('SkipCsrf decorator', () => {
    it('should be exported and available', () => {
      const { SkipCsrf } = require('../csrf.guard');

      expect(SkipCsrf).toBeDefined();
      expect(typeof SkipCsrf).toBe('function');
    });
  });
});
