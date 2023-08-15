import { ID, Product } from '@demo-t3/models';
import { useQuery } from 'react-query';

import { fetchProduct } from '../../repository';
import { QueryResult } from '../../types';

export const useProduct = (id: ID): QueryResult<Product> => {
  const { isLoading, error, data } = useQuery<Product, Error>(
    ['products', id],
    () => fetchProduct(id)
  );

  return {
    data,
    error,
    isLoading,
  };
};
