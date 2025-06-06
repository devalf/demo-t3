import { Box } from '@mui/material';
import React, { FC } from 'react';

export const ItemNotFound: FC = () => {
  return (
    <Box
      sx={{
        p: 2,
        textAlign: 'center',
      }}
    >
      Item not found
    </Box>
  );
};
