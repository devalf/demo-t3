import React from 'react';
import { Product } from '@demo-t3/models';
import { Grid } from '@mui/material';

import { ProductCard } from './ProductCard';

type ProductListProps = {
  products?: Product[];
};

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <Grid container spacing={2}>
      {products?.map((product) => (
        <Grid item key={product.id} xs={12} sm={6} md={4}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};
