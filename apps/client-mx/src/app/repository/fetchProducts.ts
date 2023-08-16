import { AxiosResponse } from 'axios';
import { ApiEntryList, ApiQueryParams, Product } from '@demo-t3/models';
import { parseProducts } from '@demo-t3/utils';

import { axiosClient } from '../http';

export const fetchProducts = async (
  params?: ApiQueryParams
): Promise<Product[]> => {
  const queryString = new URLSearchParams(params).toString();

  const { data }: AxiosResponse<ApiEntryList<Product>> = await axiosClient.get(
    `/products?${queryString}`
  );

  return parseProducts(data.entries);
};
