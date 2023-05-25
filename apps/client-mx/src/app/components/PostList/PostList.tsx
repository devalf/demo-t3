import React from 'react';
import Box from '@mui/material/Box';
import { Post } from '@demo-t3/models';

type PostListProps = {
  posts?: Post[];
};

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <>
      {posts?.map((post) => (
        <Box key={post.id}>{post.title}</Box>
      ))}
    </>
  );
};
