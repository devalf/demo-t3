import { useMutation } from '@tanstack/react-query';
import { ApiOrderParams } from '@demo-t3/models';

import { createOrder } from '../../repository';

export const useOrderMutation = () => {
  const { mutateAsync, isPending } = useMutation<
    { id: number },
    unknown,
    ApiOrderParams
  >({
    mutationFn: createOrder,
    mutationKey: ['create-order'],
  });

  return {
    createOrder: (params: ApiOrderParams) => mutateAsync(params),
    isLoading: isPending,
  };
};
