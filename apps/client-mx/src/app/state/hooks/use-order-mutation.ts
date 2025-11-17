import { useMutation } from '@tanstack/react-query';
import { ApiOrderParams } from '@demo-t3/models';

import { createOrder } from '../../repository';
import { useMutationErrorHandler } from '../../common-hooks';

export const useOrderMutation = () => {
  const handleError = useMutationErrorHandler({
    context: 'OrderMutation',
  });

  const { mutateAsync, isPending } = useMutation<
    { id: number },
    unknown,
    ApiOrderParams
  >({
    mutationFn: createOrder,
    mutationKey: ['create-order'],
    onError: handleError,
  });

  return {
    createOrder: (params: ApiOrderParams) => mutateAsync(params),
    isLoading: isPending,
  };
};
