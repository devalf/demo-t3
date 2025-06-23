import { Request } from 'express';
import { ApiDeviceInfo } from '@demo-t3/models';

export const extractDeviceInfo = (
  request: Request,
  deviceInfo?: { userAgent?: string; ip?: string } | undefined
): ApiDeviceInfo => ({
  userAgent:
    deviceInfo?.userAgent || request.headers['user-agent'] || 'Unknown',
  ip: deviceInfo?.ip || extractClientIp(request) || 'Unknown',
});

export const extractClientIp = (request: Request): string =>
  request.ip ||
  request.connection?.remoteAddress ||
  (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
  'Unknown';
