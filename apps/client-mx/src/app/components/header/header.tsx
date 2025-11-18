import React, { FC, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Badge, IconButton, Link } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { observer } from 'mobx-react-lite';

import { routes } from '../../constants';
import { useViewSize } from '../../common-hooks';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { ICartManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

import { AuthSection } from './auth-section';
import { Drawer } from './drawer';
import { MoreMenu } from './more-menu';

export const Header: FC = observer(() => {
  const { getTotalProductsInCart } = useInjection<ICartManager>(
    DependencyType.CartManager
  );
  const { isSmall } = useViewSize();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

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

          <Box
            sx={{
              display: isSmall ? 'block' : 'flex',
              gap: 1,
            }}
          >
            {isSmall ? (
              <>
                <Link
                  component={ReactRouterLink}
                  to={routes.cart}
                  sx={(theme) => ({
                    color: theme.palette.common.white,
                  })}
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
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                  data-testid={'mobile_menu_button'}
                  sx={{ ml: 1 }}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
              </>
            ) : (
              <>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}
                >
                  <AuthSection />
                </Box>

                <Link
                  component={ReactRouterLink}
                  to={routes.cart}
                  sx={(theme) => ({
                    color: theme.palette.common.white,
                  })}
                  data-testid={'link_to_cart_desktop'}
                >
                  <IconButton
                    size="large"
                    aria-label="show cart items"
                    color="inherit"
                  >
                    <Badge
                      badgeContent={getTotalProductsInCart()}
                      color="error"
                      data-testid={'cart_icon_container_desktop'}
                    >
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                </Link>
                <MoreMenu />
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
});
