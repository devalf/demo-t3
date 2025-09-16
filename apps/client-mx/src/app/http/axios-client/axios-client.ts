import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { diContainer } from '../../bootstrap/ioc/di-container';
import { AppAuthRequestingOptions } from '../../types';

export const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      const req = originalRequest as AxiosRequestConfig &
        Partial<AppAuthRequestingOptions>;
      const skipAuthRefresh = req.skipAuthRefresh === true;

      if (!skipAuthRefresh) {
        const refreshTokenManager = diContainer.refreshTokenManager;

        return refreshTokenManager.handleTokenRefresh(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
