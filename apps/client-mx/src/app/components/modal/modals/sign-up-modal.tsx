import React, { FC } from 'react';

import { useSignUpMutation } from '../../../state';

import { AuthForm } from './shared/auth-form';

export const SignUpModal: FC = () => {
  const { signUp } = useSignUpMutation();

  return (
    <AuthForm
      title="Sign Up"
      buttonText="Sign Up"
      onSubmit={signUp}
      testIdPrefix="sign_up"
      showNameField
    />
  );
};
