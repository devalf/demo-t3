import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

const { NX_PUBLIC_AUTH_SERVICE_HOST, NX_PUBLIC_AUTH_SERVICE_PORT } =
  process.env;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly authServiceUrl: string = `http://${NX_PUBLIC_AUTH_SERVICE_HOST}:${NX_PUBLIC_AUTH_SERVICE_PORT}`;

  constructor(private readonly httpService: HttpService) {}

  async proxyRequest(req: Request, res: Response): Promise<void> {
    try {
      const { method, url, body, headers } = req;

      const targetPath = url || '/';
      const targetUrl = `${this.authServiceUrl}${targetPath}`;
      const filteredHeaders = this.filterHeaders(headers);

      const config: AxiosRequestConfig = {
        method: method.toLowerCase(),
        url: targetUrl,
        headers: filteredHeaders,
        params: req.query,
        validateStatus: () => true,
      };

      if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
        config.data = body;
      }

      // this.logger.debug(`Proxying ${method} ${url} to ${targetUrl}`);

      const response = await firstValueFrom(this.httpService.request(config));
      const responseHeaders = this.filterResponseHeaders(response.headers);

      Object.entries(responseHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error('Proxy request failed:', error.message);

      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(502).json({
          error: 'Bad Gateway',
          message: 'Auth service unavailable',
        });
      }
    }
  }

  private filterHeaders(headers: Record<string, any>): Record<string, any> {
    const filtered = { ...headers };

    const headersToRemove = [
      'host',
      'content-length',
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
    ];

    headersToRemove.forEach((header) => {
      delete filtered[header];
    });

    return filtered;
  }

  private filterResponseHeaders(
    headers: Record<string, any>
  ): Record<string, any> {
    const filtered = { ...headers };

    const headersToRemove = [
      'content-encoding',
      'content-length',
      'transfer-encoding',
      'connection',
      'keep-alive',
      'upgrade',
      'proxy-authenticate',
      'proxy-authorization',
    ];

    headersToRemove.forEach((header) => {
      delete filtered[header];
    });

    return filtered;
  }
}
