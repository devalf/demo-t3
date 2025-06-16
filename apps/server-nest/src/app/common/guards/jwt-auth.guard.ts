import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from '../../auth/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['jwt'];

    if (!token) {
      throw new UnauthorizedException('No JWT token found');
    }

    try {
      const payload = await this.authService.verifyToken(token);
      (request as Request & { user?: unknown }).user = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid JWT token');
    }
  }
}
