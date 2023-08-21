import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { useProductsInfiniteQuery } from '../state';
import { ProductList } from '../components';

export const Home: React.FC = () => {
  const {
    data: products,
    error,
    isLoading,
    fetchNextPage,
    isCompleted,
  } = useProductsInfiniteQuery();

  if (isLoading && !products) {
    return <>Loading...</>;
  }

  if (error) {
    console.log('An error has occurred: ' + error.message);

    return null;
  }

  return (
    <Container maxWidth={'xl'}>
      <Box sx={{ mt: 2, mb: 2 }}>
        <ProductList
          products={products}
          fetchNextPage={fetchNextPage}
          isCompleted={isCompleted}
        />
      </Box>
    </Container>
  );
};
