import { AxiosResponse } from 'axios';
import { ApiEntryList, ApiProduct, ApiQueryParams } from '@demo-t3/models';
import { parseMetadata, parseProducts } from '@demo-t3/utils';

import { axiosClient } from '../http';

export const fetchProducts = async (
  params?: ApiQueryParams
): Promise<ApiEntryList<ApiProduct>> => {
  const queryString = new URLSearchParams(params).toString();

  const { data }: AxiosResponse<ApiEntryList<ApiProduct>> =
    await axiosClient.get(`/products?${queryString}`);

  return {
    entries: parseProducts(data.entries),
    metadata: parseMetadata(data.metadata),
  };
};
