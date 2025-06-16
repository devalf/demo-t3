import { AxiosResponse } from 'axios';
import { ApiAuthSignInParams, ApiTokenObject } from '@demo-t3/models';

import { axiosClient } from '../http';

export const sighInRequest = async (
  params: ApiAuthSignInParams
): Promise<ApiTokenObject> => {
  const { data }: AxiosResponse<ApiTokenObject> = await axiosClient.post(
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
