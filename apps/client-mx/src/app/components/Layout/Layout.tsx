import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { Home } from '../../pages';
import { Header } from '../Header/Header';

export const Layout: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};
