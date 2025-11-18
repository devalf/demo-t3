import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from '../protected-route';
import { routes } from '../../../constants';

jest.mock('../../loading-box/loading-box', () => ({
  LoadingBox: () => <div data-testid="loading-box">Loading...</div>,
}));

describe('Testing ProtectedRoute', () => {
  const TestComponent = () => (
    <div data-testid="protected-content">Protected Content</div>
  );
  const HomeComponent = () => <div data-testid="home-content">Home</div>;
  const CustomRedirectComponent = () => (
    <div data-testid="custom-redirect">Custom Redirect</div>
  );

  const renderWithRouter = (
    component: React.ReactNode,
    initialRoute = '/protected'
  ) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path={routes.home} element={<HomeComponent />} />
          <Route
            path="/custom-redirect"
            element={<CustomRedirectComponent />}
          />
          <Route path="/protected" element={component} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render children when isAllowed is true', () => {
    renderWithRouter(
      <ProtectedRoute isAllowed={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeTruthy();
  });

  it('should redirect to home when isAllowed is false', () => {
    renderWithRouter(
      <ProtectedRoute isAllowed={false}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByTestId('home-content')).toBeTruthy();
  });

  it('should redirect to custom path when redirectTo is provided', () => {
    renderWithRouter(
      <ProtectedRoute isAllowed={false} redirectTo="/custom-redirect">
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByTestId('custom-redirect')).toBeTruthy();
  });

  it('should show LoadingBox when isLoading is true', () => {
    renderWithRouter(
      <ProtectedRoute isAllowed={true} isLoading={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading-box')).toBeTruthy();
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('should render children when isLoading is false and isAllowed is true', () => {
    renderWithRouter(
      <ProtectedRoute isAllowed={true} isLoading={false}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.queryByTestId('loading-box')).toBeNull();
    expect(screen.getByTestId('protected-content')).toBeTruthy();
  });

  it('should redirect when isLoading is false and isAllowed is false', () => {
    renderWithRouter(
      <ProtectedRoute isAllowed={false} isLoading={false}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.queryByTestId('loading-box')).toBeNull();
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByTestId('home-content')).toBeTruthy();
  });

  it('should prioritize loading state over isAllowed', () => {
    renderWithRouter(
      <ProtectedRoute isAllowed={false} isLoading={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading-box')).toBeTruthy();
    expect(screen.queryByTestId('home-content')).toBeNull();
  });

  it('should use default values when optional props are not provided', () => {
    renderWithRouter(
      <ProtectedRoute isAllowed={true}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeTruthy();
  });
});
