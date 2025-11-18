import React, { FC, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import { routes } from '../../constants';

export const MoreMenu: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="large"
        aria-label="more options"
        color="inherit"
        onClick={handleMenu}
        data-testid="more_menu_button"
      >
        <KeyboardDoubleArrowDownIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: { minWidth: 160 },
          },
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 2, py: 0.5, display: 'block' }}
        >
          Links
        </Typography>
        <MenuItem
          component={ReactRouterLink}
          to={routes.about}
          onClick={handleClose}
          data-testid="more_menu_link"
        >
          About
        </MenuItem>
      </Menu>
    </>
  );
};
