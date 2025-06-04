import { useMutation } from 'react-query';

import { createOrder } from '../../repository';

export const useOrderMutation = () => {
  const { mutateAsync, isLoading } = useMutation(createOrder, {
    mutationKey: 'create-order',
  });

  return {
    createOrder: mutateAsync,
    isLoading,
  };
};
