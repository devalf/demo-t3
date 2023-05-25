import { AxiosResponse } from 'axios';

import { axiosClient } from '../http';
import { Post } from '../types';
import { parsePosts } from '../http/parsers/post';

export const fetchPosts = async (): Promise<Post[]> => {
  const { data }: AxiosResponse<Post[]> = await axiosClient.get('/posts');

  return parsePosts(data);
};
