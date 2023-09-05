import React, { FC } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Badge, IconButton, Link } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { observer } from 'mobx-react-lite';

import { useInjection } from '../../bootstrap/ioc/useInjection';
import { ICartManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/DependencyType';
import { routes } from '../../constants';

export const Header: FC = observer(() => {
  const { getTotalProductsInCart } = useInjection<ICartManager>(
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
            <Link
              component={ReactRouterLink}
              to={routes.cart}
              sx={{ color: 'white' }}
              data-testid={'link_to_cart'}
            >
              <IconButton
                size="large"
                aria-label="show cart items"
                color="inherit"
              >
                <Badge
                  badgeContent={getTotalProductsInCart()}
                  color="error"
                  data-testid={'cart_icon_container'}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
});
