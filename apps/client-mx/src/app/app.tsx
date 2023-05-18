import React, { FC } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Provider } from './bootstrap/ioc/InversifyContext';
import { Layout } from './components';
import { diContainer } from './bootstrap/ioc/DiContainer';

const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider container={diContainer.inversifyContainer}>
        <Layout />
      </Provider>
    </QueryClientProvider>
  );
};

export default App;
