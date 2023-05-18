import { AxiosResponse } from 'axios';

import { axiosClient, parseProducts } from '../http';
import { APIProductsResponse, Product } from '../types';

export const fetchProducts = async (): Promise<Product[]> => {
  const {
    data: { data },
  }: AxiosResponse<APIProductsResponse> = await axiosClient.get(
    '/products/all'
  );

  return parseProducts(data.products);
};
