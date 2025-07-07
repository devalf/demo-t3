import React, { FC } from 'react';

import { useSignInMutation } from '../../../state';

import { AuthForm } from './shared/auth-form';

export const LoginInModal: FC = () => {
  const { signIn } = useSignInMutation();

  const handleSubmit = async (values: { email: string; password: string }) => {
    await signIn(values);
  };

  return (
    <AuthForm
      title="Sign In"
      buttonText="Sign In"
      onSubmit={handleSubmit}
      testIdPrefix="login"
    />
  );
};
