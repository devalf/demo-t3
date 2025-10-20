import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { diContainer } from '../../bootstrap/ioc/di-container';
import { AppAuthRequestingOptions } from '../../types';

const getCsrfTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split('; ');
  const csrfCookie = cookies.find((cookie) => cookie.startsWith('csrfToken='));

  return csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;
};

export const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();

    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = getCsrfTokenFromCookie();

      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

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
