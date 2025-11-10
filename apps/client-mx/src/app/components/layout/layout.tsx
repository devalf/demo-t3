import React, { FC, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Home } from '../../pages';
import { Header } from '../header/header';
import { routes } from '../../constants';
import { LoadingBox } from '../loading-box/loading-box';
import { NotFoundPage } from '../not-found-page/not-found-page';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IUserManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';

const Product = lazy(() => import('../../pages/product'));
const Cart = lazy(() => import('../../pages/cart'));
const OrderSuccess = lazy(() => import('../../pages/order-success'));
const VerifyEmail = lazy(() => import('../../pages/verify-email'));

export const Layout: FC = () => {
  useInjection<IUserManager>(DependencyType.UserManager);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route
          path={routes.product}
          element={
            <Suspense fallback={<LoadingBox />}>
              <Product />
            </Suspense>
          }
        />
        <Route
          path={routes.cart}
          element={
            <Suspense fallback={<LoadingBox />}>
              <Cart />
            </Suspense>
          }
        />
        <Route
          path={routes.orderSuccess}
          element={
            <Suspense fallback={<LoadingBox />}>
              <OrderSuccess />
            </Suspense>
          }
        />
        <Route
          path={routes.verifyEmail}
          element={
            <Suspense fallback={<LoadingBox />}>
              <VerifyEmail />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};
