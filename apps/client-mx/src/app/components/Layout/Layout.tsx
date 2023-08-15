import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Home, ProductPage } from '../../pages';
import { Header } from '../Header/Header';
import { routes } from '../../constants';

export const Layout: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.product} element={<ProductPage />} />
      </Routes>
    </Router>
  );
};
