import React from 'react';
import Box from '@mui/material/Box';
import { Product } from '@demo-t3/models';

type ProductListProps = {
  products?: Product[];
};

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <>
      {products?.map((product) => (
        <Box key={product.id}>{product.name}</Box>
      ))}
    </>
  );
};
