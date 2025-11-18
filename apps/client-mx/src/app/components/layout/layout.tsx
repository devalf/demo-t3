import React, { FC, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Home } from '../../pages/home';
import { Header } from '../header/header';
import { routes } from '../../constants';
import { LoadingBox } from '../loading-box/loading-box';
import { NotFoundPage } from '../not-found-page/not-found-page';
import { useInjection } from '../../bootstrap/ioc/use-injection';
import { IUserManager } from '../../store/interfaces';
import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { ProtectedRoute } from '../protected-route/protected-route';

const Product = lazy(() => import('../../pages/product'));
const Cart = lazy(() => import('../../pages/cart'));
const OrderSuccess = lazy(() => import('../../pages/order-success'));
const VerifyEmail = lazy(() => import('../../pages/verify-email'));
const Profile = lazy(() => import('../../pages/profile'));
const About = lazy(() => import('../../pages/about'));

export const Layout: FC = observer(() => {
  const { userData, isLoading } = useInjection<IUserManager>(
    DependencyType.UserManager
  );

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
        <Route
          path={routes.profile}
          element={
            <Suspense fallback={<LoadingBox />}>
              <ProtectedRoute isAllowed={!!userData} isLoading={isLoading}>
                <Profile />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path={routes.about}
          element={
            <Suspense fallback={<LoadingBox />}>
              <About />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
});
