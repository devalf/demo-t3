import { Request } from 'express';
import { ApiJwtPayload } from '@demo-t3/models';

export type AuthenticatedRequest = Request & {
  user: ApiJwtPayload;
  accessToken: string;
};
