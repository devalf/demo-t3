import { ApiAccessTokenExpiresIn, ApiAuthSignInParams } from '@demo-t3/models';
import { useMutation } from '@tanstack/react-query';

import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { useMutationErrorHandler } from '../../common-hooks';
import { sighInRequest } from '../../repository';
import { IModalManager, IUserManager } from '../../store/interfaces';

export const useSignInMutation = () => {
  const { fetchUserData } = useInjection<IUserManager>(
    DependencyType.UserManager
  );
  const { closeModal } = useInjection<IModalManager>(
    DependencyType.ModalManager
  );
  const handleError = useMutationErrorHandler({
    context: 'SignInMutation',
  });

  const { mutateAsync, isPending } = useMutation<
    ApiAccessTokenExpiresIn,
    unknown,
    ApiAuthSignInParams
  >({
    mutationFn: sighInRequest,
    mutationKey: ['sign-in'],
    onSuccess: async () => {
      closeModal();
      void fetchUserData();
    },
    onError: handleError,
  });

  return {
    signIn: mutateAsync,
    isLoading: isPending,
  };
};
