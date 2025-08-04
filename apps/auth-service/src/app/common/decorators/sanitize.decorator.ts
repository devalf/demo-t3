import { Transform } from 'class-transformer';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import * as xss from 'xss';

const sanitizeOptions: xss.IFilterXSSOptions = {
  whiteList: {}, // No HTML tags allowed
  stripIgnoreTag: true, // Remove all HTML tags
  stripIgnoreTagBody: ['script'], // Remove script tag content
  allowCommentTag: false, // No HTML comments
  css: false, // No CSS
};

export const Sanitize = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const sanitized = xss.filterXSS(value, sanitizeOptions);

    return sanitized
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  });

export const IsNotDangerous = (validationOptions?: ValidationOptions) =>
  function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotDangerous',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return true;
          }

          const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b/gi,
            /<object\b/gi,
            /<embed\b/gi,
            /<link\b/gi,
            /<meta\b/gi,
          ];

          return !dangerousPatterns.some((pattern) => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains potentially dangerous content`;
        },
      },
    });
  };
