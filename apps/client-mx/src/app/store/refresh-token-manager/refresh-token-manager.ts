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

  async handleTokenRefresh(
    originalRequest: InternalAxiosRequestConfig
  ): Promise<unknown> {
    if (this.hasRefreshFailed) {
      throw new Error('Refresh token has already failed');
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      await refreshTokenRequest();

      this.processQueue(null);

      return axiosClient(originalRequest);
    } catch (error) {
      this.hasRefreshFailed = true;
      this.processQueue(error as AxiosError);

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
