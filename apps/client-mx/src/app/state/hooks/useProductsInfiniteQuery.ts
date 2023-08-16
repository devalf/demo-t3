import { QueryFunctionContext, useInfiniteQuery } from 'react-query';
import { Product } from '@demo-t3/models';

import { ENTITIES_LIMIT } from '../../constants';
import { QueryResult } from '../../types';
import { fetchProducts } from '../../repository';

export const useProductsInfiniteQuery = (): QueryResult<Product[]> & {
  fetchNextPage: () => void;
} => {
  const { data, error, isLoading, fetchNextPage } = useInfiniteQuery({
    queryKey: ['products-infinite-query'],
    queryFn: ({ pageParam }: QueryFunctionContext) => {
      let offset: number;

      if (pageParam === undefined || pageParam === 1) {
        offset = 0;
      } else {
        offset = (pageParam - 1) * ENTITIES_LIMIT;
      }

      return fetchProducts({ offset: offset.toString() });
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
    error: error as Error, // TODO provide a better type
    isLoading,
    fetchNextPage,
  };
};
