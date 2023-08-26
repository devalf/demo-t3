import React, { FC } from 'react';
import Box from '@mui/material/Box';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { generatePath, useNavigate } from 'react-router-dom';

import { ICartManager } from '../../store/interfaces';
import { useInjection } from '../../bootstrap/ioc/useInjection';
import { DependencyType } from '../../bootstrap/ioc/DependencyType';
import { routes } from '../../constants';

export const CartForm: FC = observer(() => {
  const {
    cartItems,
    removeProductFromCart,
    totalPrice,
    updateCartItemQuantity,
    getCartItemTotalPrice,
  } = useInjection<ICartManager>(DependencyType.CartManager);

  const navigate = useNavigate();

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
          <Grid container key={cartItem.product.id} alignItems={'center'}>
            <Grid item xs={12} md={4}>
              <Box
                display={'flex'}
                flexDirection={'row'}
                gap={2}
                sx={{
                  cursor: 'pointer',
                }}
                onClick={() =>
                  navigate(
                    generatePath(routes.product, { id: cartItem.product.id })
                  )
                }
              >
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
                  <Typography variant={'body1'} sx={{ fontWeight: 600, mt: 2 }}>
                    Product price: ${cartItem.product.price}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                display={'flex'}
                gap={2}
                justifyContent={{
                  xs: 'space-between',
                  md: 'space-around',
                }}
                sx={{
                  my: {
                    xs: 4,
                  },
                }}
              >
                <Box>
                  <Typography variant={'body1'}>Quantity:</Typography>
                  <TextField
                    type={'number'}
                    value={cartItem.quantity}
                    onChange={(event) => {
                      updateCartItemQuantity(
                        cartItem.product,
                        Number(event.target.value)
                      );
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant={'body1'}>Total amount price:</Typography>
                  <Typography variant={'h6'}>
                    ${getCartItemTotalPrice(cartItem)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{
                textAlign: {
                  xs: 'left',
                  md: 'right',
                },
              }}
            >
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
          p: 2,
        }}
      >
        <Typography variant={'h6'} sx={{ fontWeight: 600 }}>
          Total price: ${totalPrice}
        </Typography>
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
