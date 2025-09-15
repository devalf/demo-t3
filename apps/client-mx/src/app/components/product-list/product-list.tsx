import React, { FC } from 'react';
import { ApiProduct } from '@demo-t3/models';
import { Grid } from '@mui/material';

import { InfiniteLoader } from '../infinite-loader/infinite-loader';
import { FetchNextPage } from '../../types';

import { ProductCard } from './product-card';

type ProductListProps = {
  products?: ApiProduct[];
  fetchNextPage: FetchNextPage;
  isCompleted: boolean;
};

export const ProductList: FC<ProductListProps> = ({
  products,
  fetchNextPage,
  isCompleted,
}) => {
  return (
    <>
      <Grid container spacing={2} data-testid={'products_list'}>
        {products?.map((product) => (
          <Grid
            item
            key={product.id}
            xs={12}
            sm={6}
            md={4}
            data-testid={'product_card_grid_item'}
          >
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      <InfiniteLoader fetchNextPage={fetchNextPage} isCompleted={isCompleted} />
    </>
  );
};
