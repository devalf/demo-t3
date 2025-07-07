import React, { FC } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { extractErrorMessage } from '@demo-t3/utils';

import { useInjection } from '../../../../bootstrap/ioc/use-injection';
import { IModalManager, IToastManager } from '../../../../store/interfaces';
import { DependencyType } from '../../../../bootstrap/ioc/dependency-type';

const AuthSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

type AuthFormProps = {
  title: string;
  buttonText: string;
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
  testIdPrefix: string;
};

export const AuthForm: FC<AuthFormProps> = ({
  title,
  buttonText,
  onSubmit,
  testIdPrefix,
}) => {
  const { closeModal } = useInjection<IModalManager>(
    DependencyType.ModalManager
  );
  const { showToast } = useInjection<IToastManager>(
    DependencyType.ToastManager
  );

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    enableReinitialize: true,
    validationSchema: AuthSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
        closeModal();
      } catch (error) {
        const errorMessage = extractErrorMessage(error);

        showToast({
          message: errorMessage,
          variant: 'error',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}
      >
        {title}
      </Typography>

      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          fullWidth
          required
          autoFocus
          data-testid={`${testIdPrefix}_email_input`}
        />

        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          fullWidth
          required
          data-testid={`${testIdPrefix}_password_input`}
        />

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <LoadingButton
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            loading={formik.isSubmitting}
            fullWidth
            data-testid="login_submit_button"
          >
            {buttonText}
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};
