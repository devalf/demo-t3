import { QueryFunctionContext, useInfiniteQuery } from 'react-query';
import { Product, RequestError } from '@demo-t3/models';

import { ENTITIES_LIMIT } from '../../constants';
import { QueryResult } from '../../types';
import { fetchProducts } from '../../repository';

export const useProductsInfiniteQuery = (): QueryResult<Product[]> & {
  fetchNextPage: () => void;
} => {
  const { data, error, isLoading, fetchNextPage } = useInfiniteQuery({
    queryKey: ['products-infinite-query'],
    queryFn: ({ pageParam = 1 }: QueryFunctionContext) => {
      const offset: string = ((pageParam - 1) * ENTITIES_LIMIT).toString();

      return fetchProducts({ offset });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalProductsAmount = allPages.flat().length;

      const isLessThanEntitiesLimit =
        totalProductsAmount % ENTITIES_LIMIT !== 0;

      if (isLessThanEntitiesLimit) return undefined;

      return totalProductsAmount / ENTITIES_LIMIT + 1;
    },
  });

  return {
    data: data?.pages.flat(),
    error: error as RequestError,
    isLoading,
    fetchNextPage,
  };
};
