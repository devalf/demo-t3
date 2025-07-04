import React, { FC, SyntheticEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { Alert, AlertColor, Snackbar } from '@mui/material';

import { IToastManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { useInjection } from '../../bootstrap/ioc/use-injection';

export const Toast: FC = observer(() => {
  const toastManager = useInjection<IToastManager>(DependencyType.ToastManager);

  const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    toastManager.closeToast();
  };

  return (
    <Snackbar
      open={toastManager.isOpen}
      autoHideDuration={toastManager.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={toastManager.variant as AlertColor}
        sx={{ width: '100%' }}
        elevation={6}
        variant="filled"
      >
        {toastManager.message}
      </Alert>
    </Snackbar>
  );
});
