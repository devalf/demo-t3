import React, { FC, PropsWithChildren } from 'react';
import Card from '@mui/material/Card';

export const ProductCard: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Card variant={'outlined'} sx={{ p: 2 }}>
      {children}
    </Card>
  );
};
