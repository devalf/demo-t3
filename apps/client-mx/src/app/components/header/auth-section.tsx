import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';

import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { useViewSize } from '../../common-hooks';
import { IModalManager, IUserManager } from '../../store/interfaces';
import { ModalID } from '../modal/modal';

import { UserDropdown } from './user-dropdown';

type AuthSectionProps = {
  onCLick?: () => void;
};

export const AuthSection: FC<AuthSectionProps> = observer(({ onCLick }) => {
  const { showModal } = useInjection<IModalManager>(
    DependencyType.ModalManager
  );
  const { isSignedIn, isLoading: isUserLoading } = useInjection<IUserManager>(
    DependencyType.UserManager
  );

  const { isSmall } = useViewSize();

  if (isUserLoading) {
    return null;
  }

  if (isSignedIn) {
    return <UserDropdown />;
  }

  const handleClick = (template: ModalID) => {
    onCLick && onCLick();
    showModal(template);
  };

  return (
    <>
      <Button
        variant={'contained'}
        color={'chrome'}
        onClick={() => handleClick('LOGIN_MODAL')}
        data-testid={'log_in_btn'}
        fullWidth={isSmall}
      >
        Login
      </Button>
      <Button
        variant={'contained'}
        color={'warning'}
        sx={{ ml: isSmall ? 0 : 2, mt: isSmall ? 2 : 0 }}
        onClick={() => handleClick('SIGNUP_MODAL')}
        data-testid={'sign_up_btn'}
        fullWidth={isSmall}
      >
        Sign Up
      </Button>
    </>
  );
});
