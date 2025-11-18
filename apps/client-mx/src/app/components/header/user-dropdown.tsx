import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { useViewSize } from '../../common-hooks';
import { routes } from '../../constants';
import { IUserManager } from '../../store/interfaces';

export const UserDropdown: FC = observer(() => {
  const { logout } = useInjection<IUserManager>(DependencyType.UserManager);

  const { isSmall } = useViewSize();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = async () => {
    await logout();

    handleClose();
  };

  return (
    <>
      <Box
        onClick={handleMenu}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
      >
        <IconButton
          color="inherit"
          data-testid={'user_header_icon'}
          sx={{ width: 'min-content' }}
        >
          <AccountCircleIcon />
        </IconButton>
        {isSmall && <Typography> User Name // TBD</Typography>}
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        MenuListProps={{
          sx: { p: 0 },
        }}
      >
        <MenuItem component={Link} to={routes.profile} onClick={handleClose}>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>Log out</MenuItem>
      </Menu>
    </>
  );
});
