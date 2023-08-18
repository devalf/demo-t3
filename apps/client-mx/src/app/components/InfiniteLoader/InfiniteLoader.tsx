import { Box } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
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
    threshold: 0.5,
  });

  const fetchNextPageCallback = useCallback(() => {
    fetchNextPage();
  }, [isCompleted, inView]);

  useEffect(() => {
    if (inView) {
      fetchNextPageCallback();
    }
  }, [inView]);

  return (
    <Box
      ref={ref}
      sx={{
        p: 2,
        textAlign: 'center',
        display: isCompleted ? 'none' : 'block',
      }}
    >
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
