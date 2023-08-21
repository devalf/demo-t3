import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Badge, IconButton, Link } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';

import { useInjection } from '../../bootstrap/ioc/useInjection';
import { ICartManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/DependencyType';
import { routes } from '../../constants';

export const Header: React.FC = observer(() => {
  const { getTotalProductsInCart, cartItems } = useInjection<ICartManager>(
    DependencyType.CartManager
  );

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex' }}>
            <AccountBalanceIcon />
            <Box sx={{ pl: 1 }}>
              <Link
                component={ReactRouterLink}
                to={routes.home}
                sx={{ color: 'white' }}
                data-testid={'link_to_home'}
              >
                Home
              </Link>
            </Box>
          </Box>
          <Box>
            <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
              onClick={() => {
                console.log('Cart Modal functionality will be defined');
                console.log(toJS(cartItems));
              }}
            >
              <Badge badgeContent={getTotalProductsInCart()} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
});
