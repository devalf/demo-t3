import { AxiosResponse } from 'axios';
import { ApiEntryList, Product } from '@demo-t3/models';
import { parseProducts } from '@demo-t3/utils';

import { axiosClient } from '../http';

export const fetchProducts = async (): Promise<Product[]> => {
  const { data }: AxiosResponse<ApiEntryList<Product>> = await axiosClient.get(
    '/products'
  );

  return parseProducts(data.entries);
};
