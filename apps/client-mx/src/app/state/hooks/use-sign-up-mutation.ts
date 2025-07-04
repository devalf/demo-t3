import { useMutation } from 'react-query';

import { signUpRequest } from '../../repository';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IUserManager } from '../../store/interfaces/iuser-manager';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

export const useSignUpMutation = () => {
  const { setIsSignedIn } = useInjection<IUserManager>(
    DependencyType.UserManager
  );

  const { mutateAsync, isLoading } = useMutation(signUpRequest, {
    mutationKey: 'sign-up',
    onSuccess: () => {
      setIsSignedIn(true);
    },
  });

  return {
    signUp: mutateAsync,
    isLoading,
  };
};
