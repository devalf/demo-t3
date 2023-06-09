import { Post } from '@demo-t3/models';

export const parsePost = (post: Post): Post => {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    userId: post.userId,
  };
};

export const parsePosts = (posts: Post[]): Post[] => {
  return posts.map((post) => parsePost(post));
};
