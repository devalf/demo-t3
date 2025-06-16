import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiAuthSignInParams } from '@demo-t3/models';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const host = this.configService.get<string>('NX_PUBLIC_AUTH_SERVICE_HOST');
    const port = this.configService.get<string>('NX_PUBLIC_AUTH_SERVICE_PORT');

    this.authServiceUrl = `http://${host}:${port}/api/auth`;
  }

  async signIn(params: ApiAuthSignInParams) {
    try {
      const url = `${this.authServiceUrl}/sign-in`;
      const response = await firstValueFrom(
        this.httpService.post(url, params, {
          validateStatus: () => true,
        })
      );

      if (response.status !== 200 || !response.data?.token) {
        throw new Error(response.data?.message || 'Invalid credentials');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Sign-in failed:', error.message);

      throw error;
    }
  }

  /**
   * TODO finish it
   * this logic will be refactored in the next iteration. Cashing with the Redis will be implemented
   *
   * @param token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const url = `${this.authServiceUrl}/verify`;
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { token },
          {
            validateStatus: () => true,
          }
        )
      );

      if (response.status !== 200 || !response.data?.isValid) {
        throw new Error(response.data?.error || 'Invalid token');
      }

      return response.data.payload;
    } catch (error) {
      this.logger.error('Token verification failed:', error.message);

      throw error;
    }
  }
}
