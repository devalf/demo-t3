import { AxiosResponse } from 'axios';
import {
  ApiAccessTokenExpiresIn,
  ApiAuthSignInParams,
  ApiUser,
} from '@demo-t3/models';

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

export const fetchUserProfileData = async (): Promise<ApiUser | false> => {
  try {
    const { data }: AxiosResponse<ApiUser> = await axiosClient.get('/auth/me');

    return data;
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
      await axiosClient.post('/auth/refresh', {}, configSkipAuthRefresh);

    return data;
  };

export const verifyEmailRequest = async (token: string): Promise<void> => {
  const { data }: AxiosResponse<void> = await axiosClient.get(
    '/auth/verify-email',
    {
      params: { token },
      ...configSkipAuthRefresh,
    }
  );

  return data;
};
