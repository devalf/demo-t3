import { QueryFunctionContext, useInfiniteQuery } from 'react-query';
import { ApiProduct, RequestError } from '@demo-t3/models';

import { ENTITIES_LIMIT } from '../../constants';
import { UseInfiniteQueryResult } from '../../types';
import { fetchProducts } from '../../repository';

export const useProductsInfiniteQuery =
  (): UseInfiniteQueryResult<ApiProduct> => {
    const { data, error, isLoading, fetchNextPage } = useInfiniteQuery({
      queryKey: ['products-infinite-query'],
      queryFn: ({ pageParam = 1 }: QueryFunctionContext) => {
        const offset: string = ((pageParam - 1) * ENTITIES_LIMIT).toString();

        return fetchProducts({ offset });
      },
      getNextPageParam: (lastPage, allPages) => {
        const totalLoadedProductsAmount = allPages
          .map((page) => page.entries)
          .flat().length;

        const isLessThanEntitiesLimit =
          totalLoadedProductsAmount % ENTITIES_LIMIT !== 0;

        const { total, offset } = lastPage.metadata;
        const allProductsLoaded = totalLoadedProductsAmount === total;
        const offsetIsGreaterThanTotal = offset > total;

        if (
          isLessThanEntitiesLimit ||
          allProductsLoaded ||
          offsetIsGreaterThanTotal
        ) {
          return undefined;
        }

        // next page number
        return totalLoadedProductsAmount / ENTITIES_LIMIT + 1;
      },
    });

    const aggregatedProductsData = data?.pages
      .map((page) => page.entries)
      .flat();
    const lastPage = data?.pages[data.pages.length - 1];
    const total = lastPage?.metadata.total;

    return {
      data: aggregatedProductsData,
      error: error as RequestError,
      isLoading,
      fetchNextPage,
      isCompleted: aggregatedProductsData?.length === total,
    };
  };
