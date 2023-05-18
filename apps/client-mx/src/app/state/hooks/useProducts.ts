import { useQuery } from 'react-query';

import { Product } from '../../types';
import { fetchProducts } from '../../repository/fetchProducts';

export const useProducts = () => {
  const { isLoading, error, data } = useQuery<Product[], Error>(
    'repoData',
    () => fetchProducts()
  );

  return {
    data,
    error,
    isLoading,
  };
};
