import React, { FC } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const LoginInModal: FC = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    enableReinitialize: true,
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('Logging in with:', values);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Handle successful login
        // For example: closeModal(), redirectUser(), etc.
      } catch (error) {
        console.error('Login failed:', error);
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
        Sign In
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
          data-testid="login_email_input"
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
          data-testid="login_password_input"
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
            Sign In
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};
