import { ApiProduct, ID } from '@demo-t3/models';
import { useQuery } from '@tanstack/react-query';

import { fetchProduct } from '../../repository';
import { QueryResult } from '../../types';

export const useProduct = (id: ID): QueryResult<ApiProduct> => {
  const { isPending, error, data } = useQuery<ApiProduct, Error>({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id),
  });

  return {
    data,
    error,
    isLoading: isPending,
  };
};
