import React, { FC } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { Provider } from './bootstrap/ioc/inversify-context';
import { Layout } from './components';
import { diContainer } from './bootstrap/ioc/di-container';
import { theme } from './style/theme';
import { Modal } from './components/modal/modal';

const queryClient = new QueryClient();

const { NX_PUBLIC_RENDER_DEV_TOOLS = 'false' } = process.env;

const shouldRenderDevtools = JSON.parse(NX_PUBLIC_RENDER_DEV_TOOLS);

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Provider container={diContainer.inversifyContainer}>
          <CssBaseline>
            <Layout />
            <Modal />
          </CssBaseline>
        </Provider>
      </ThemeProvider>

      {shouldRenderDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
