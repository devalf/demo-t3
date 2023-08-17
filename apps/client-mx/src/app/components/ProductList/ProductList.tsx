import React from 'react';
import { Product } from '@demo-t3/models';
import { Grid } from '@mui/material';

import { InfiniteLoader } from '../InfiniteLoader/InfiniteLoader';
import { FetchNextPage } from '../../types';

import { ProductCard } from './ProductCard';

type ProductListProps = {
  products?: Product[];
  fetchNextPage: FetchNextPage;
  isCompleted: boolean;
};

export const ProductList: React.FC<ProductListProps> = ({
  products,
  fetchNextPage,
  isCompleted,
}) => {
  return (
    <>
      <Grid container spacing={2}>
        {products?.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      <InfiniteLoader fetchNextPage={fetchNextPage} isCompleted={isCompleted} />
    </>
  );
};
