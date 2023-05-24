import React from 'react';
import Box from '@mui/material/Box';

import { ProductsList } from '../components';
import { useProducts } from '../state';

export const Home: React.FC = () => {
  const { data: products, error, isLoading } = useProducts();

  if (isLoading) {
    return <>Loading...</>;
  }

  if (error) {
    console.log('An error has occurred: ' + error.message);

    return null;
  }

  return (
    <Box>
      <ProductsList products={products} />
      <Box>www</Box>
    </Box>
  );
};
