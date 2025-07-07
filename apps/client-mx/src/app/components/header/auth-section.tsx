import React, { FC } from 'react';
import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IModalManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { IUserManager } from '../../store/interfaces/iuser-manager';

import { UserDropdown } from './user-dropdown';

export const AuthSection: FC = observer(() => {
  const { showModal } = useInjection<IModalManager>(
    DependencyType.ModalManager
  );
  const { isSignedIn, isLoading: isUserLoading } = useInjection<IUserManager>(
    DependencyType.UserManager
  );

  if (isUserLoading) {
    return null;
  }

  if (isSignedIn) {
    return <UserDropdown />;
  }

  return (
    <>
      <Button
        variant={'contained'}
        color={'chrome'}
        onClick={() => showModal('LOGIN_MODAL')}
        data-testid={'log_in_btn'}
      >
        Login
      </Button>
      <Button
        variant={'contained'}
        color={'warning'}
        sx={{ ml: 2 }}
        onClick={() => showModal('SIGNUP_MODAL')}
        data-testid={'sign_up_btn'}
      >
        Sign Up
      </Button>
    </>
  );
});
