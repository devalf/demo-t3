import React, { FC, PropsWithChildren } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useInjection } from 'inversify-react';

import { IModalManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

export const ModalContainer: FC<PropsWithChildren> = observer(
  ({ children }) => {
    const { isOpen, closeModal } = useInjection<IModalManager>(
      DependencyType.ModalManager
    );

    return (
      <Dialog
        open={isOpen}
        onClose={closeModal}
        closeAfterTransition
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{
          timeout: 300,
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <IconButton
            aria-label="close"
            onClick={closeModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    );
  }
);
