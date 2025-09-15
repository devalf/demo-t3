import { ApiProduct, ID } from '@demo-t3/models';
import { useQuery } from 'react-query';

import { fetchProduct } from '../../repository';
import { QueryResult } from '../../types';

export const useProduct = (id: ID): QueryResult<ApiProduct> => {
  const { isLoading, error, data } = useQuery<ApiProduct, Error>(
    ['products', id],
    () => fetchProduct(id)
  );

  return {
    data,
    error,
    isLoading,
  };
};
