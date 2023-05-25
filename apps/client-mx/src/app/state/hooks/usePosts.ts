import { useQuery } from 'react-query';
import { Post } from '@demo-t3/models';

import { fetchPosts } from '../../repository/fetchPosts';

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
