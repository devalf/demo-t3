import { InternalAxiosRequestConfig } from 'axios';

export interface IRefreshTokenManager {
  handleTokenRefresh(
    originalRequest: InternalAxiosRequestConfig
  ): Promise<unknown>;
  resetRefreshFailureState(): void;
  startProactiveRefresh(expiresInSeconds: number): void;
  stopProactiveRefresh(): void;
}
