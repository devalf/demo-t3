import React from 'react';
import Box from '@mui/material/Box';

import { Product } from '../../types';

type ProductsListProps = {
  products?: Product[];
};

export const ProductsList: React.FC<ProductsListProps> = ({ products }) => {
  return (
    <>
      {products?.map((product) => (
        <Box key={product.guid}>
          {product.title} - {product.price}
        </Box>
      ))}
    </>
  );
};
