import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ACCESS_TOKEN, ApiJwtPayload } from '@demo-t3/models';

import { AuthService } from '../../modules/auth/auth.service';
import { AuthenticatedRequest } from '../types';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies?.[ACCESS_TOKEN];

    if (!accessToken) {
      throw new UnauthorizedException('No accessToken token found');
    }

    try {
      const payload = await this.authService.verifyToken(accessToken);
      const authenticatedRequest = request as AuthenticatedRequest;

      authenticatedRequest.user = payload as ApiJwtPayload;
      authenticatedRequest.accessToken = accessToken;

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Invalid accessToken token'
      );
    }
  }
}
