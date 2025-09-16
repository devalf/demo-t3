import { AxiosResponse } from 'axios';
import { ApiAccessTokenExpiresIn, ApiAuthSignInParams } from '@demo-t3/models';

import { axiosClient } from '../http';
import { AppAuthAxiosRequestConfig } from '../types';

const configSkipAuthRefresh: AppAuthAxiosRequestConfig = {
  skipAuthRefresh: true,
};

export const signUpRequest = async (
  params: ApiAuthSignInParams
): Promise<void> => {
  const { data }: AxiosResponse<void> = await axiosClient.post(
    '/auth/register',
    params,
    configSkipAuthRefresh
  );

  return data;
};

export const sighInRequest = async (
  params: ApiAuthSignInParams
): Promise<ApiAccessTokenExpiresIn> => {
  const { data }: AxiosResponse<ApiAccessTokenExpiresIn> =
    await axiosClient.post('/auth/sign-in', params, configSkipAuthRefresh);

  return data;
};

export const checkAuthStatusRequest = async (): Promise<boolean> => {
  try {
    await axiosClient.get('/auth/me');

    return true;
  } catch {
    return false;
  }
};

export const logoutRequest = async (): Promise<void> => {
  await axiosClient.post('/auth/logout', {}, configSkipAuthRefresh);
};

export const refreshTokenRequest =
  async (): Promise<ApiAccessTokenExpiresIn> => {
    const { data }: AxiosResponse<ApiAccessTokenExpiresIn> =
      await axiosClient.post('/auth/refresh', {});

    return data;
  };
