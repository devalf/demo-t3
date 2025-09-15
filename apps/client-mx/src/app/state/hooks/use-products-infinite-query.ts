import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { ApiEntryList, ApiProduct, RequestError } from '@demo-t3/models';

import { ENTITIES_LIMIT } from '../../constants';
import { UseInfiniteQueryResult } from '../../types';
import { fetchProducts } from '../../repository';

export const useProductsInfiniteQuery =
  (): UseInfiniteQueryResult<ApiProduct> => {
    const query = useInfiniteQuery<
      ApiEntryList<ApiProduct>,
      RequestError,
      ApiProduct[],
      [string],
      number
    >({
      queryKey: ['products-infinite-query'],
      initialPageParam: 1,
      queryFn: ({ pageParam = 1 }: { pageParam: number }) => {
        const offset: string = ((pageParam - 1) * ENTITIES_LIMIT).toString();

        return fetchProducts({ offset });
      },
      getNextPageParam: (
        lastPage: ApiEntryList<ApiProduct>,
        allPages: ApiEntryList<ApiProduct>[]
      ) => {
        const totalLoadedProductsAmount = allPages
          .map((page: ApiEntryList<ApiProduct>) => page.entries)
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
      select: (data: InfiniteData<ApiEntryList<ApiProduct>>) =>
        data.pages.flatMap((p) => p.entries),
    });

    const {
      error,
      isPending,
      fetchNextPage,
      hasNextPage,
      data: aggregatedProductsData,
    } = query;

    return {
      data: aggregatedProductsData,
      error: error as RequestError,
      isLoading: isPending,
      fetchNextPage,
      isCompleted: !hasNextPage,
    };
  };
