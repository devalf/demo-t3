import React from 'react';
import Box from '@mui/material/Box';

import { PostList } from '../components';
import { usePosts } from '../state';

export const Home: React.FC = () => {
  const { data: posts, error, isLoading } = usePosts();

  if (isLoading) {
    return <>Loading...</>;
  }

  if (error) {
    console.log('An error has occurred: ' + error.message);

    return null;
  }

  return (
    <Box>
      <PostList posts={posts} />
    </Box>
  );
};
