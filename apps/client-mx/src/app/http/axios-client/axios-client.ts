import axios, { AxiosError, AxiosResponse } from 'axios';

import { diContainer } from '../../bootstrap/ioc/di-container';

export const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshTokenManager = diContainer.refreshTokenManager;

      return refreshTokenManager.handleTokenRefresh(originalRequest);
    }

    return Promise.reject(error);
  }
);
