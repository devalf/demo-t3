import { InternalAxiosRequestConfig } from 'axios';

export interface IRefreshTokenManager {
  handleTokenRefresh(
    originalRequest: InternalAxiosRequestConfig
  ): Promise<unknown>;
  resetRefreshFailureState(): void;
}
