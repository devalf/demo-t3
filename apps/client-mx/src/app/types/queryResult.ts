export type QueryResult<T> = {
  data?: T;
  error?: Error | null;
  isLoading: boolean;
};
