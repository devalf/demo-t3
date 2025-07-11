import { useMutation } from 'react-query';

import { sighInRequest } from '../../repository';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IUserManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

export const useSignInMutation = () => {
  const { setIsSignedIn } = useInjection<IUserManager>(
    DependencyType.UserManager
  );

  const { mutateAsync, isLoading } = useMutation(sighInRequest, {
    mutationKey: 'sign-in',
    onSuccess: (response) => {
      setIsSignedIn(true, response.accessTokenExpiresIn);
    },
  });

  return {
    signIn: mutateAsync,
    isLoading,
  };
};
