import React, { FC, ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';

export type WithPath = { path?: string };
export type CustomRenderOptions = RenderOptions & WithPath;
export type WithChildren = { children: ReactNode };

export const MockRouter: FC<WithChildren & WithPath> = ({ children, path }) => (
  <MemoryRouter initialEntries={path ? [path] : undefined}>
    {children}
  </MemoryRouter>
);

export const SharedMockProviders: FC<WithChildren> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export const createAppWrapper = (
  options?: CustomRenderOptions
): FC<WithChildren> => {
  const CustomWrapper = options?.wrapper;

  if (CustomWrapper) {
    return ({ children }: WithChildren) => (
      <SharedMockProviders>
        <CustomWrapper>
          <MockRouter path={options?.path}>{children}</MockRouter>
        </CustomWrapper>
      </SharedMockProviders>
    );
  }

  return ({ children }: WithChildren) => (
    <SharedMockProviders>
      <MockRouter path={options?.path}>{children}</MockRouter>
    </SharedMockProviders>
  );
};

export const renderApp = (ui: ReactElement, options?: CustomRenderOptions) => {
  const wrapper = createAppWrapper(options);

  return render(ui, { ...options, wrapper });
};
