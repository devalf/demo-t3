import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Link } from '@mui/material';

import { useInjection } from '../../bootstrap/ioc/useInjection';
import { IStoreExampleTwo } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/DependencyType';
import { routes } from '../../constants';

export const Header: React.FC = () => {
  const storeExampleTwo = useInjection<IStoreExampleTwo>(
    DependencyType.StoreExampleTwo
  );

  const stingFromStore = storeExampleTwo.getStringFromStoreExampleOne();
  console.log(
    'log by `storeExampleTwo` store method, used injection another store:',
    stingFromStore
  );

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AccountBalanceIcon />
          <Box sx={{ pl: 1 }}>
            <Link
              component={ReactRouterLink}
              to={routes.home}
              sx={{ color: 'white' }}
            >
              Home
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
