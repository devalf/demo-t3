import { Box, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import { useProduct } from '../state';
import { PathParams } from '../types';

export const ProductPage: FC = () => {
  const { id } = useParams() as PathParams;
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading && !product) {
    return <>Loading...</>;
  }

  if (error) {
    console.log('An error has occurred: ' + error.message);

    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Product Single Page</Typography>

      {product && (
        <Box>
          <Typography variant="h6">{product.name}</Typography>
          <Typography>{product.about}</Typography>
          <Typography color="text.secondary">${product.price}</Typography>
        </Box>
      )}
    </Box>
  );
};
