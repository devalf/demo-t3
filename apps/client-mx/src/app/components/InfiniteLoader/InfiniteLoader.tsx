import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

type InfiniteLoaderProps = {
  fetchNextPage: () => void;
};

export const InfiniteLoader: React.FC<InfiniteLoaderProps> = ({
  fetchNextPage,
}) => {
  const { ref, inView } = useInView({
    threshold: 1,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <Box ref={ref} sx={{ p: 2, textAlign: 'center' }}>
      loading...
      <br />
      <Typography variant="caption" color="textSecondary">
        this component is under construction yet, TBD
      </Typography>
    </Box>
  );
};
