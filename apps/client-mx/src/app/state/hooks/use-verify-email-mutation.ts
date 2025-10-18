import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { verifyEmailRequest } from '../../repository';
import { routes } from '../../constants';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IToastManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

export const useVerifyEmailMutation = () => {
  const navigate = useNavigate();

  const { showToast } = useInjection<IToastManager>(
    DependencyType.ToastManager
  );

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
  });

  return {
    verifyEmail: mutateAsync,
    isLoading: isPending,
    isError,
    isSuccess,
  };
};
