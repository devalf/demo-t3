import { ApiOrderParams } from '@demo-t3/models';

import { axiosClient } from '../http';

export const createOrder = async (
  params: ApiOrderParams
): Promise<{ id: number }> => {
  const { data } = await axiosClient.post('/order', params);

  return data;
};
