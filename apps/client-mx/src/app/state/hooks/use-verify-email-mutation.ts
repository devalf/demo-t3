import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { verifyEmailRequest } from '../../repository';
import { routes } from '../../constants';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IToastManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { useMutationErrorHandler } from '../../common-hooks';

export const useVerifyEmailMutation = () => {
  const navigate = useNavigate();

  const { showToast } = useInjection<IToastManager>(
    DependencyType.ToastManager
  );
  const handleError = useMutationErrorHandler({
    context: 'VerifyEmailMutation',
  });

  const { mutateAsync, isPending, isError, isSuccess } = useMutation<
    void,
    unknown,
    string
  >({
    mutationFn: verifyEmailRequest,
    mutationKey: ['verify-email'],
    onSuccess: () => {
      navigate(routes.home);
      showToast({
        message:
          'Email verified successfully, please use your credentials to Sign In',
        variant: 'success',
      });
    },
    onError: handleError,
  });

  return {
    verifyEmail: mutateAsync,
    isLoading: isPending,
    isError,
    isSuccess,
  };
};
