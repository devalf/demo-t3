import { Alert, Box, Container, Typography } from '@mui/material';
import React, { FC, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useVerifyEmailMutation } from '../state';
import { LoadingBox } from '../components';

export const VerifyEmail: FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { verifyEmail, isLoading, isError, isSuccess } =
    useVerifyEmailMutation();

  const hasVerifiedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!token || hasVerifiedRef.current) {
      return;
    }

    hasVerifiedRef.current = true;

    verifyEmail(token);
  }, [token, verifyEmail]);

  return (
    <Container maxWidth={'xl'} sx={{ my: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Typography component="h4" variant={'h4'}>
          Email Verification
        </Typography>

        {!token && (
          <Alert severity="error">
            Invalid verification link. Please check your email and try again.
          </Alert>
        )}

        {token && isLoading && (
          <>
            <LoadingBox />
            <Typography>Verifying your email...</Typography>
          </>
        )}

        {token && isError && (
          <Alert severity="error">
            Email verification failed. The link may be expired or invalid.
            Please try registering again.
          </Alert>
        )}

        {token && isSuccess && (
          <Alert>
            Email verified successfully! Redirecting to home page...
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail;
