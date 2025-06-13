import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Catch all routes under `/auth` and proxy them to the auth service
   * This uses the All() decorator to catch all HTTP methods
   */
  @All('*')
  async proxyAuthRequest(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response
  ) {
    return this.authService.proxyRequest(req, res);
  }
}
