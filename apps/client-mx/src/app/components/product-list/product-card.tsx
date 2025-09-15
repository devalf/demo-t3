import React, { FC } from 'react';
import { generatePath, Link as ReactRouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { ApiProduct } from '@demo-t3/models';

import { routes } from '../../constants';

type ProductCardProps = {
  product: ApiProduct;
};

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  return (
    <Card
      variant={'outlined'}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        height: '100%',
      }}
      data-testid={'product_card'}
    >
      <Box>
        <CardMedia
          sx={{ height: 140 }}
          image={product.picture}
          title={product.name}
          data-testid={'product_card_picture'}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            data-testid={'product_card_name'}
          >
            {product.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid={'product_card_about'}
          >
            {product.about}
          </Typography>
        </CardContent>
      </Box>
      <CardActions sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ ml: 1 }}
          data-testid={'product_card_price'}
        >
          ${product.price}
        </Typography>
        <Box sx={{ textAlign: 'center', width: '100%', mt: 2, mb: 2 }}>
          <Button
            variant="outlined"
            to={generatePath(routes.product, { id: product.id })}
            component={ReactRouterLink}
            data-testid={'learn_more_btn'}
          >
            Learn More
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
