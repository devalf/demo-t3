export type QueryResult<T> = {
  data?: T;
  error?: Error | null;
  isLoading: boolean;
};

export type FetchNextPage = () => void;

export type UseInfiniteQueryResult<T> = QueryResult<T[]> & {
  fetchNextPage: FetchNextPage;
  isCompleted: boolean;
};
