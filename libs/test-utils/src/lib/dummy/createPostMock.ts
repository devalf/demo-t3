import { Post } from '@demo-t3/models';

export const createPostMock = (): Post => ({
  id: 1,
  title: 'Post dummy title',
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  userId: 5,
});
