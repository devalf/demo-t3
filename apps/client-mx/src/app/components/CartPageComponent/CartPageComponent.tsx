import React, { FC, memo } from 'react';
import Box from '@mui/material/Box';

import { CartItem } from '../../store/interfaces';

type CartPageProps = {
  cartItems: CartItem[];
};

export const CartPage: FC<CartPageProps> = ({ cartItems }) => {
  return (
    <Box>
      {cartItems.map((item) => (
        <Box key={item.product.id}>
          {item.product.name} - {item.quantity}
        </Box>
      ))}
    </Box>
  );
};

export const CartPageComponent = memo(CartPage);
