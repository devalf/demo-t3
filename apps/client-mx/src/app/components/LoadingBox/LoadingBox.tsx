import React, { FC } from 'react';
import { Box } from '@mui/material';

import loading from '../../assets/loading.gif';

export const LoadingBox: FC = () => {
  return (
    <Box
      sx={{
        p: 2,
        textAlign: 'center',
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
