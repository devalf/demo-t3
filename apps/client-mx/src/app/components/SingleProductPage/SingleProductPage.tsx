import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { observer } from 'mobx-react-lite';
import { useInjection } from 'inversify-react';
import { AxiosError } from 'axios';

import { PathParams } from '../../types';
import { useProduct } from '../../state';
import { ICartManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/DependencyType';
import { LoadingBox } from '../LoadingBox/LoadingBox';
import { ItemNotFound } from '../ItemNotFound/ItemNotFound';

export const SingleProductPage: FC = observer(() => {
  const { id } = useParams() as PathParams;
  const { data: product, isLoading, error } = useProduct(id);

  const { addProductToCart, removeProductFromCart, isProductInCart } =
    useInjection<ICartManager>(DependencyType.CartManager);

  if (isLoading && !product) {
    return <LoadingBox />;
  }

  if (error) {
    if (error instanceof AxiosError) {
      const { response } = error;

      if (response?.status === 404) {
        return <ItemNotFound />;
      }
    }

    console.log('An error has occurred: ' + error.message);

    return null;
  }

  if (!product) {
    return <ItemNotFound />;
  }

  return (
    <Container maxWidth={'xl'} sx={{ my: 2 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Card variant={'outlined'} sx={{ textAlign: 'center', p: 2 }}>
            <Box
              component={'img'}
              src={product.picture}
              alt={'product image'}
              sx={{ maxWidth: 300 }}
              data-testid={'product_picture'}
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" data-testid={'product_name'}>
            {product.name}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
            data-testid={'product_price'}
          >
            ${product.price}
          </Typography>
          <Typography sx={{ mt: 1 }} data-testid={'product_about'}>
            {product.about}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{ display: 'inline-block', minWidth: 125, fontWeight: 600 }}
            >
              Company
            </Typography>
            <Typography component={'span'} data-testid={'product_company'}>
              {product.company}
            </Typography>
          </Box>

          {product?.tags && (
            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{ display: 'inline-block', minWidth: 125, fontWeight: 600 }}
                data-testid={'product_tags_label'}
              >
                Tags
              </Typography>
              <Typography component={'span'} data-testid={'product_tags'}>
                {product.tags.map((tag, idx) => {
                  const tagsLength = product.tags ? product.tags.length : 0;
                  const suffixComa = idx < tagsLength - 1 ? ', ' : '';

                  return `${tag}${suffixComa}`;
                })}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 5 }}>
            <Button
              variant={'contained'}
              color={'primary'}
              size={'large'}
              endIcon={<ShoppingCartIcon />}
              disabled={isProductInCart(product)}
              onClick={() => addProductToCart(product)}
              sx={{ mr: 2, mb: 2 }}
              data-testid={'add_to_cart_button'}
            >
              Add to cart
            </Button>

            {isProductInCart(product) && (
              <Button
                variant={'contained'}
                color={'secondary'}
                size={'large'}
                endIcon={<RemoveShoppingCartIcon />}
                onClick={() => removeProductFromCart(product)}
                sx={{ mb: 2 }}
                data-testid={'remove_from_cart_button'}
              >
                Remove from cart
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
});
