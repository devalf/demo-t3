import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { injectable } from 'inversify';

import { refreshTokenRequest } from '../../repository';
import { axiosClient } from '../../http';
import { IRefreshTokenManager } from '../interfaces';
import { diContainer } from '../../bootstrap/ioc/di-container';

type QueuedRequest = {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  config: InternalAxiosRequestConfig;
};

@injectable()
export class RefreshTokenManager implements IRefreshTokenManager {
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];
  private hasRefreshFailed = false;
  private lastRefreshError: AxiosError | null = null;
  private proactiveRefreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_BUFFER_MS = 10 * 1000; // 10 seconds

  async handleTokenRefresh(
    originalRequest: InternalAxiosRequestConfig
  ): Promise<unknown> {
    if (this.hasRefreshFailed) {
      if (this.lastRefreshError) {
        throw this.lastRefreshError;
      }

      throw new Error('Refresh token has already failed');
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshResponse = await refreshTokenRequest();

      this.processQueue(null);
      this.scheduleNextProactiveRefresh(refreshResponse.accessTokenExpiresIn);

      return axiosClient(originalRequest);
    } catch (error) {
      this.hasRefreshFailed = true;
      this.lastRefreshError = error as AxiosError;
      this.processQueue(this.lastRefreshError);

      try {
        const userManager = diContainer.userManager;

        userManager.handleTokenRefreshFailure();
      } catch (diError) {
        console.warn('Could not update user manager state:', diError);
      }

      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  resetRefreshFailureState(): void {
    this.hasRefreshFailed = false;
    this.lastRefreshError = null;
  }

  startProactiveRefresh(expiresInSeconds: number): void {
    this.stopProactiveRefresh();
    this.scheduleNextProactiveRefresh(expiresInSeconds);
  }

  stopProactiveRefresh(): void {
    if (this.proactiveRefreshInterval) {
      clearTimeout(this.proactiveRefreshInterval);
      this.proactiveRefreshInterval = null;
    }
  }

  private async performProactiveRefresh(): Promise<void> {
    this.isRefreshing = true;

    try {
      const refreshResponse = await refreshTokenRequest();

      this.scheduleNextProactiveRefresh(refreshResponse.accessTokenExpiresIn);
    } finally {
      this.isRefreshing = false;
    }
  }

  private scheduleNextProactiveRefresh(expiresInSeconds: number): void {
    const expiresInMs = expiresInSeconds * 1000;
    const refreshIntervalMs = Math.max(
      expiresInMs - this.REFRESH_BUFFER_MS,
      1000
    );

    this.proactiveRefreshInterval = setTimeout(async () => {
      try {
        if (!this.hasRefreshFailed && !this.isRefreshing) {
          await this.performProactiveRefresh();
        }
      } catch (error) {
        console.warn('Proactive token refresh failed:', error);
      }
    }, refreshIntervalMs);
  }

  private processQueue(error: AxiosError | null) {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        resolve(axiosClient(config));
      }
    });

    this.failedQueue = [];
  }
}
