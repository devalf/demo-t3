import { useQuery } from 'react-query';
import { Product } from '@demo-t3/models';

import { fetchProducts } from '../../repository/fetchProducts';

export const useProducts = () => {
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
