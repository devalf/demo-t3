import { useMutation } from '@tanstack/react-query';

import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { useMutationErrorHandler } from '../../common-hooks';
import { signUpRequest } from '../../repository';
import { IModalManager, IToastManager } from '../../store/interfaces';

export const useSignUpMutation = () => {
  const { closeModal } = useInjection<IModalManager>(
    DependencyType.ModalManager
  );
  const { showToast } = useInjection<IToastManager>(
    DependencyType.ToastManager
  );
  const handleError = useMutationErrorHandler({
    context: 'SignUpMutation',
  });

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
    onError: handleError,
  });

  return {
    signUp: mutateAsync,
    isLoading: isPending,
  };
};
