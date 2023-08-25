import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { ICartManager } from '../../store/interfaces';
import { useInjection } from '../../bootstrap/ioc/useInjection';
import { DependencyType } from '../../bootstrap/ioc/DependencyType';

export const CartPageComponent: FC = observer(() => {
  const { cartItems, removeProductFromCart } = useInjection<ICartManager>(
    DependencyType.CartManager
  );

  return (
    <Box sx={{ border: 1, borderColor: 'grey.500', borderRadius: 1 }}>
      <Box
        sx={{
          p: 2,
          '& .MuiGrid-container:not(:last-child)': {
            mb: 2,
            pb: 2,
            borderBottom: 1,
            borderColor: 'grey.500',
            borderBottomStyle: 'dashed',
          },
        }}
      >
        {cartItems.map((cartItem) => (
          <Grid container key={cartItem.product.id}>
            <Grid item xs={12} md={4}>
              <Box display={'flex'} flexDirection={'row'} gap={2}>
                <Box
                  component={'img'}
                  src={cartItem.product.picture}
                  alt={'product image'}
                  sx={{ maxWidth: 100 }}
                  data-testid={'cart_item_product_picture'}
                />
                <Box>
                  <Typography variant={'h6'}>
                    {cartItem.product.name}
                  </Typography>
                  <Typography variant={'body1'}>
                    {cartItem.product.company}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display={'flex'} gap={2} justifyContent={'space-around'}>
                <Typography variant={'h6'}>
                  Quantity: {cartItem.quantity}
                </Typography>
                <Typography variant={'h6'}>
                  ${cartItem.product.price}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant={'contained'}
                color={'secondary'}
                size={'large'}
                onClick={() => removeProductFromCart(cartItem.product)}
              >
                Remove
              </Button>
            </Grid>
          </Grid>
        ))}
      </Box>

      <Box
        sx={{
          borderTop: 1,
          borderColor: 'grey.500',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Button
          variant={'contained'}
          color={'primary'}
          size={'large'}
          onClick={() => console.log('Order request will be developed')}
        >
          Make order
        </Button>
      </Box>
    </Box>
  );
});
