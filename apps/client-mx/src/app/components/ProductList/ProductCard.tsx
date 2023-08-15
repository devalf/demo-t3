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
import { Product } from '@demo-t3/models';

import { routes } from '../../constants';

type ProductCardProps = {
  product: Product;
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
    >
      <Box>
        <CardMedia
          sx={{ height: 140 }}
          image={product.picture}
          title={product.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.about}
          </Typography>
        </CardContent>
      </Box>
      <CardActions sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
          ${product.price}
        </Typography>
        <Box sx={{ textAlign: 'center', width: '100%', mt: 2, mb: 2 }}>
          <Button
            variant="outlined"
            to={generatePath(routes.product, { id: product.id })}
            component={ReactRouterLink}
          >
            Learn More
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
