import { FC } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { observer } from 'mobx-react-lite';

import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { routes } from '../../constants';
import { IUserManager } from '../../store/interfaces';

import { AuthSection } from './auth-section';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const Drawer: FC<DrawerProps> = observer(({ open, onClose }) => {
  const { userData, logout } = useInjection<IUserManager>(
    DependencyType.UserManager
  );

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <MuiDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      data-testid={'mobile_drawer'}
    >
      <Box
        sx={{
          width: 280,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
        role="presentation"
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={onClose}
            data-testid={'mobile_drawer_close_button'}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {userData ? (
          <>
            <Box
              component={ReactRouterLink}
              to={routes.profile}
              onClick={onClose}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                color: 'inherit',
                p: 1,
              }}
              data-testid={'drawer_profile_link'}
            >
              <AccountCircleIcon />
              <Typography
                sx={userData.name ? undefined : { color: 'text.secondary' }}
              >
                {userData.name || 'name not set'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={handleLogout}
              fullWidth
              data-testid={'drawer_logout_button'}
            >
              Log out
            </Button>
          </>
        ) : (
          <AuthSection onCLick={onClose} />
        )}

        <Divider sx={{ my: 1 }} />

        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
          Links
        </Typography>

        <Link
          component={ReactRouterLink}
          to={routes.about}
          onClick={onClose}
          underline="hover"
          color="inherit"
          sx={{ p: 1 }}
          data-testid={'drawer_about_link'}
        >
          About
        </Link>
      </Box>
    </MuiDrawer>
  );
});
