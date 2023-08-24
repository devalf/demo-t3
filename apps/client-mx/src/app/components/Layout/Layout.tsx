import React, { FC, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Home } from '../../pages';
import { Header } from '../Header/Header';
import { routes } from '../../constants';
import { LoadingBox } from '../LoadingBox/LoadingBox';

const Product = lazy(() => import('../../pages/Product'));
const Cart = lazy(() => import('../../pages/Cart'));

export const Layout: FC = () => {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
};
