import React, { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { routes } from '../../constants';
import { LoadingBox } from '../loading-box/loading-box';

type ProtectedRouteProps = {
  children: ReactNode;
  isAllowed: boolean;
  isLoading?: boolean;
  redirectTo?: string;
};

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  isAllowed,
  isLoading = false,
  redirectTo = routes.home,
}) => {
  if (isLoading) {
    return <LoadingBox />;
  }

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};
