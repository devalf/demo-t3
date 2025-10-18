import { useMutation } from '@tanstack/react-query';

import { signUpRequest } from '../../repository';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IModalManager, IToastManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

export const useSignUpMutation = () => {
  const { closeModal } = useInjection<IModalManager>(
    DependencyType.ModalManager
  );
  const { showToast } = useInjection<IToastManager>(
    DependencyType.ToastManager
  );

  const { mutateAsync, isPending } = useMutation<
    void,
    unknown,
    Parameters<typeof signUpRequest>[0]
  >({
    mutationFn: signUpRequest,
    mutationKey: ['sign-up'],
    onSuccess: () => {
      closeModal();
      showToast({
        message:
          'Registration successful! Please check your email to verify your account.',
        variant: 'success',
      });
    },
  });

  return {
    signUp: mutateAsync,
    isLoading: isPending,
  };
};
