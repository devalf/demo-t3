import { useQuery } from 'react-query';
import { Product } from '@demo-t3/models';

import { fetchProducts } from '../../repository';
import { QueryResult } from '../../types';

export const useProducts = (): QueryResult<Product[]> => {
  const { isLoading, error, data } = useQuery<Product[], Error>(
    'products',
    () => fetchProducts()
  );

  return {
    data,
    error,
    isLoading,
  };
};
