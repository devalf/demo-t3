import * as winston from 'winston';

export const createWinstonConfig = (
  serviceName: string
): winston.LoggerOptions => {
  return {
    level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(
        ({ timestamp, level, message, context, trace, ...meta }) => {
          const logObject: Record<string, unknown> = {
            timestamp,
            level,
            service: serviceName,
            context: context || 'Application',
            message,
            ...meta,
          };

          if (trace) {
            logObject['trace'] = trace;
          }

          return JSON.stringify(logObject);
        }
      )
    ),
    transports: [
      new winston.transports.Console({
        handleExceptions: true,
        handleRejections: true,
      }),
    ],
    exitOnError: false,
  };
};
