import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { inject, injectable } from 'inversify';

import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import type {
  IRefreshTokenManager,
  IUserManager,
} from '../../store/interfaces';
import { AppAuthRequestingOptions } from '../../types';
import { axiosClient } from '../axios-client/axios-client';

export type IAuthInterceptorService = {
  setupInterceptors(): void;
};

@injectable()
export class AuthInterceptorService implements IAuthInterceptorService {
  constructor(
    @inject(DependencyType.RefreshTokenManager)
    private readonly refreshTokenManager: IRefreshTokenManager,
    @inject(DependencyType.UserManager)
    private readonly userManager: IUserManager
  ) {}

  setupInterceptors(): void {
    axiosClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          const req = originalRequest as AxiosRequestConfig &
            Partial<AppAuthRequestingOptions>;
          const skipAuthRefresh = req.skipAuthRefresh === true;

          if (!skipAuthRefresh) {
            try {
              return await this.refreshTokenManager.handleTokenRefresh(
                originalRequest
              );
            } catch (refreshError) {
              // Token refresh failed - clear user data
              this.userManager.handleTokenRefreshFailure();

              throw refreshError;
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }
}
