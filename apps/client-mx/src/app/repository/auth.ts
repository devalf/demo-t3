import { AxiosResponse } from 'axios';
import { ApiCreateUserParams, ApiTokenObject } from '@demo-t3/models';

import { axiosClient } from '../http';

export const loginRequest = async (
  params: ApiCreateUserParams
): Promise<ApiTokenObject> => {
  const { data }: AxiosResponse<ApiTokenObject> = await axiosClient.post(
    '/auth/sign-in',
    params
  );

  return data;
};
