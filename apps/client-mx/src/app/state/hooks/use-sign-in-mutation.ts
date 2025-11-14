import { useMutation } from '@tanstack/react-query';
import { ApiAccessTokenExpiresIn, ApiAuthSignInParams } from '@demo-t3/models';

import { sighInRequest } from '../../repository';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IModalManager, IUserManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

export const useSignInMutation = () => {
  const { fetchUserData } = useInjection<IUserManager>(
    DependencyType.UserManager
  );
  const { closeModal } = useInjection<IModalManager>(
    DependencyType.ModalManager
  );

  const { mutateAsync, isPending } = useMutation<
    ApiAccessTokenExpiresIn,
    unknown,
    ApiAuthSignInParams
  >({
    mutationFn: sighInRequest,
    mutationKey: ['sign-in'],
    onSuccess: async () => {
      await fetchUserData();

      closeModal();
    },
  });

  return {
    signIn: mutateAsync,
    isLoading: isPending,
  };
};
