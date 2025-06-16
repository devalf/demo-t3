import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IUserManager } from '../../store/interfaces/iuser-manager';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

export const UserDropdown: FC = observer(() => {
  const { setIsSignedIn } = useInjection<IUserManager>(
    DependencyType.UserManager
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    setIsSignedIn(false);
    handleClose();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleMenu}>
        <AccountCircleIcon />
      </IconButton>
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
        <MenuItem onClick={handleLogout}>Log out</MenuItem>
      </Menu>
    </>
  );
});
