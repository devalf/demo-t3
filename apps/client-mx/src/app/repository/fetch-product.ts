import { AxiosResponse } from 'axios';
import { ApiProduct, ID } from '@demo-t3/models';
import { parseProduct } from '@demo-t3/utils';

import { axiosClient } from '../http';

export const fetchProduct = async (id: ID): Promise<ApiProduct> => {
  const { data }: AxiosResponse<ApiProduct> = await axiosClient.get(
    `/products/${id}`
  );

  return parseProduct(data);
};
