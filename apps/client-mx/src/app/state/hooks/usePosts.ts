import { useQuery } from 'react-query';

import { fetchPosts } from '../../repository/fetchPosts';
import { Post } from '../../types';

export const usePosts = () => {
  const { isLoading, error, data } = useQuery<Post[], Error>('repoData', () =>
    fetchPosts()
  );

  return {
    data,
    error,
    isLoading,
  };
};
