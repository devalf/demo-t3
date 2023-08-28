import { axiosClient } from '../http';

/**
 * Since this is simulation of order creation, I don't need to pass any data.
 * and I don't need to create a general model for this.
 */
export const createOrder = async (): Promise<{ id: number }> => {
  const { data } = await axiosClient.post('/order');

  return data;
};
