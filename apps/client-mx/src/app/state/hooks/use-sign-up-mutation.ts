import { useMutation } from '@tanstack/react-query';

import { signUpRequest } from '../../repository';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IUserManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

export const useSignUpMutation = () => {
  const { setIsSignedIn } = useInjection<IUserManager>(
    DependencyType.UserManager
  );

  const { mutateAsync, isPending } = useMutation<
    void,
    unknown,
    Parameters<typeof signUpRequest>[0]
  >({
    mutationFn: signUpRequest,
    mutationKey: ['sign-up'],
    onSuccess: () => {
      setIsSignedIn(true);
    },
  });

  return {
    signUp: mutateAsync,
    isLoading: isPending,
  };
};
