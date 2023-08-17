import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { FetchNextPage } from '../../types';
import loading from '../../assets/loading.gif';

type InfiniteLoaderProps = {
  fetchNextPage: FetchNextPage;
  isCompleted: boolean;
};

export const InfiniteLoader: React.FC<InfiniteLoaderProps> = ({
  fetchNextPage,
  isCompleted,
}) => {
  const { ref, inView } = useInView({
    threshold: 1,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  if (isCompleted) {
    return null;
  }

  return (
    <Box ref={ref} sx={{ p: 2, textAlign: 'center' }}>
      <Box
        component={'img'}
        alt={'loading'}
        src={loading}
        sx={{
          width: 30,
          height: 30,
        }}
      />
    </Box>
  );
};
