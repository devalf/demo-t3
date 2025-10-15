import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { verifyEmailRequest } from '../../repository';
import { routes } from '../../constants';

export const useVerifyEmailMutation = () => {
  const navigate = useNavigate();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation<
    void,
    unknown,
    string
  >({
    mutationFn: verifyEmailRequest,
    mutationKey: ['verify-email'],
    onSuccess: () => {
      navigate(routes.home);
    },
  });

  return {
    verifyEmail: mutateAsync,
    isLoading: isPending,
    isError,
    isSuccess,
  };
};
