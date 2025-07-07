import { AxiosResponse } from 'axios';
import { ApiAuthSignInParams, ApiAuthTokens } from '@demo-t3/models';

import { axiosClient } from '../http';

export const signUpRequest = async (
  params: ApiAuthSignInParams
): Promise<void> => {
  const { data }: AxiosResponse<void> = await axiosClient.post(
    '/auth/register',
    params
  );

  return data;
};

export const sighInRequest = async (
  params: ApiAuthSignInParams
): Promise<ApiAuthTokens> => {
  const { data }: AxiosResponse<ApiAuthTokens> = await axiosClient.post(
    '/auth/sign-in',
    params
  );

  return data;
};

export const checkAuthStatusRequest = async (): Promise<boolean> => {
  try {
    await axiosClient.get('/auth/me', { withCredentials: true });

    return true;
  } catch (error: unknown) {
    return false;
  }
};

export const logoutRequest = async (): Promise<void> => {
  await axiosClient.post('/auth/logout', {}, { withCredentials: true });
};
