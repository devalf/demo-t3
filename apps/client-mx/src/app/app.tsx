import React, { FC } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { CssBaseline } from '@mui/material';

import { Provider } from './bootstrap/ioc/InversifyContext';
import { Layout } from './components';
import { diContainer } from './bootstrap/ioc/DiContainer';

const queryClient = new QueryClient();

const { NX_RENDER_DEV_TOOLS = 'false' } = process.env;

const shouldRenderDevtools = JSON.parse(NX_RENDER_DEV_TOOLS);

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider container={diContainer.inversifyContainer}>
        <CssBaseline>
          <Layout />
        </CssBaseline>
      </Provider>

      {shouldRenderDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
