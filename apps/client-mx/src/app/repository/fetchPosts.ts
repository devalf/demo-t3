import { AxiosResponse } from 'axios';
import { Post } from '@demo-t3/models';

import { axiosClient, parsePosts } from '../http';

export const fetchPosts = async (): Promise<Post[]> => {
  const { data }: AxiosResponse<Post[]> = await axiosClient.get('/posts');

  return parsePosts(data);
};
