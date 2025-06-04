import { Box, Container, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useSearchParams } from 'react-router-dom';

export const OrderSuccess: FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <Container maxWidth={'xl'}>
      <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
        {orderId ? (
          <>
            <Typography variant={'h5'}>
              Your order has been successfully placed!
            </Typography>
            <Typography variant={'h5'}>Order ID: {orderId}</Typography>
          </>
        ) : (
          <Typography variant={'h5'}>Order Page. No data to render</Typography>
        )}
      </Box>
    </Container>
  );
};

export default OrderSuccess;
