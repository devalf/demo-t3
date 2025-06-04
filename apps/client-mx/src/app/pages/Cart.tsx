import { Box, Container, Typography } from '@mui/material';
import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { CartForm } from '../components';
import { useInjection } from '../bootstrap/ioc/use-injection';
import { ICartManager } from '../store/interfaces';
import { DependencyType } from '../bootstrap/ioc/dependency-type';

const Cart: FC = observer(() => {
  const { cartItems } = useInjection<ICartManager>(DependencyType.CartManager);

  const cartIsEmpty = cartItems.length === 0;

  return (
    <Container maxWidth={'xl'}>
      <Box sx={{ mt: 2, mb: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant={'h4'} data-testid={'cart_heading'}>
            Cart {cartIsEmpty && <>- is empty</>}
          </Typography>
        </Box>

        {!cartIsEmpty && <CartForm />}
      </Box>
    </Container>
  );
});

export default Cart;
