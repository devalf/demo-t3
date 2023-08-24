import { Box, Container } from '@mui/material';
import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useInjection } from '../bootstrap/ioc/useInjection';
import { ICartManager } from '../store/interfaces';
import { DependencyType } from '../bootstrap/ioc/DependencyType';
import { CartPageComponent } from '../components';

const Cart: FC = observer(() => {
  const { cartItems } = useInjection<ICartManager>(DependencyType.CartManager);

  return (
    <Container maxWidth={'xl'}>
      <Box sx={{ mt: 2, mb: 2 }}>
        <div>Cart: {cartItems.length === 0 && <>Cart is empty</>}</div>

        <CartPageComponent cartItems={cartItems} />
      </Box>
    </Container>
  );
});

export default Cart;
