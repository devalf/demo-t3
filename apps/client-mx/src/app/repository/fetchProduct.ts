import { AxiosResponse } from 'axios';
import { ID, Product } from '@demo-t3/models';
import { parseProduct } from '@demo-t3/utils';

import { axiosClient } from '../http';

export const fetchProduct = async (id: ID): Promise<Product> => {
  const { data }: AxiosResponse<Product> = await axiosClient.get(
    `/products/${id}`
  );

  return parseProduct(data);
};
