import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

export type HttpResponse<T> = {
  status: number;
  data: T;
  headers?: Record<string, string>;
};

export type HttpRequestOptions = {
  headers?: Record<string, string>;
  timeout?: number;
  validateStatus?: (status: number) => boolean;
};

const DEFAULT_REQUEST_TIMEOUT = 5000;

@Injectable()
export class HttpClient {
  constructor(private readonly httpService: HttpService) {}

  async get<T>(
    url: string,
    params?: Record<string, unknown>,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    const config: AxiosRequestConfig = {
      params,
      headers: options?.headers,
      timeout: options?.timeout ?? DEFAULT_REQUEST_TIMEOUT,
      validateStatus: options?.validateStatus ?? (() => true),
    };

    const response = await firstValueFrom(this.httpService.get<T>(url, config));

    return {
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  }

  /**
   * Makes an HTTP POST request
   *
   * @param url - Request URL
   * @param data - Request body
   * @param options - Additional request options
   * @returns Promise with response data
   *
   * @example
   * ```typescript
   * const response = await httpClient.post<TokenResponse>(
   *   'https://api.example.com/auth/login',
   *   { email: 'user@example.com', password: 'secret' },
   *   { timeout: 3000 }
   * );
   * ```
   */
  async post<T>(
    url: string,
    data: unknown,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout ?? DEFAULT_REQUEST_TIMEOUT,
      validateStatus: options?.validateStatus ?? (() => true),
    };

    const response = await firstValueFrom(
      this.httpService.post<T>(url, data, config)
    );

    return {
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  }

  async put<T>(
    url: string,
    data: unknown,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout ?? DEFAULT_REQUEST_TIMEOUT,
      validateStatus: options?.validateStatus ?? (() => true),
    };

    const response = await firstValueFrom(
      this.httpService.put<T>(url, data, config)
    );

    return {
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  }

  async patch<T>(
    url: string,
    data: unknown,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout ?? DEFAULT_REQUEST_TIMEOUT,
      validateStatus: options?.validateStatus ?? (() => true),
    };

    const response = await firstValueFrom(
      this.httpService.patch<T>(url, data, config)
    );

    return {
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  }

  async delete<T>(
    url: string,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    const config: AxiosRequestConfig = {
      headers: options?.headers,
      timeout: options?.timeout ?? DEFAULT_REQUEST_TIMEOUT,
      validateStatus: options?.validateStatus ?? (() => true),
    };

    const response = await firstValueFrom(
      this.httpService.delete<T>(url, config)
    );

    return {
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  }
}
