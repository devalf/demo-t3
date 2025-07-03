import { ApiJwtPayload, ApiRefreshTokenPayload } from '@demo-t3/models';

export const generateApiJwtPayload = (
  options?: Partial<ApiJwtPayload>
): ApiJwtPayload => ({
  id: 11,
  email: 'test@example.com',
  role: 'CLIENT',
  ...options,
});

export const generateApiRefreshTokenPayload = (
  options?: Partial<ApiJwtPayload>
): ApiRefreshTokenPayload => ({
  userId: 21,
  tokenId: 'token-id',
  type: 'refresh',
  ...options,
});
