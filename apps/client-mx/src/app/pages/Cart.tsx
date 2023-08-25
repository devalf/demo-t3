import { Box, Container, Typography } from '@mui/material';
import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { CartPageComponent } from '../components';
import { useInjection } from '../bootstrap/ioc/useInjection';
import { ICartManager } from '../store/interfaces';
import { DependencyType } from '../bootstrap/ioc/DependencyType';

const Cart: FC = observer(() => {
  const { cartItems } = useInjection<ICartManager>(DependencyType.CartManager);

  const carrIsEmpty = cartItems.length === 0;

  return (
    <Container maxWidth={'xl'}>
      <Box sx={{ mt: 2, mb: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant={'h4'}>
            Cart {carrIsEmpty && <>- is empty</>}
          </Typography>
        </Box>

        {!carrIsEmpty && <CartPageComponent />}
      </Box>
    </Container>
  );
});

export default Cart;
