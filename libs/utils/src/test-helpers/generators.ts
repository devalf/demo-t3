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

// ORM model generator - matches Prisma User entity structure
export const generateOrmUser = (
  options?: Partial<{
    id: number;
    name: string | null;
    password: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'CLIENT';
    settings: Record<string, unknown>;
    is_active: boolean;
    deleted_at: Date | null;
    original_email: string | null;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
  }>
) => ({
  id: 11,
  name: 'Test User',
  password: '$2b$10$hashedpassword',
  email: 'test2@example.com',
  role: 'CLIENT' as const,
  settings: {},
  is_active: true,
  deleted_at: null,
  original_email: null,
  email_verified: true,
  created_at: new Date('2025-01-01T00:00:00Z'),
  updated_at: new Date('2025-01-01T00:00:00Z'),
  ...options,
});
