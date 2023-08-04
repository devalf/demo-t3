import React from 'react';
import Box from '@mui/material/Box';

import { useProducts } from '../state';
import { ProductList } from '../components';

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
      <ProductList products={products} />
    </Box>
  );
};
