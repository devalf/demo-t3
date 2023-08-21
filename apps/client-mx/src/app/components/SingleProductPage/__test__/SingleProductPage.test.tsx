import { render, waitFor } from '@testing-library/react';
import { Container } from 'inversify';
import { mockProduct } from '@demo-t3/dummy-data';
import { QueryClient, QueryClientProvider } from 'react-query';

import { SingleProductPage } from '../SingleProductPage';
import { createTestContainer } from '../../../bootstrap/ioc/test.helpers';
import { Provider } from '../../../bootstrap/ioc/InversifyContext';
import { fetchProduct } from '../../../repository';

jest.mock('../../../repository');

describe('SingleProductPage', () => {
  let inversifyContainer: Container;

  // TODO provide base render util with providers, transfer this definition to appropriate file
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
        retry: false,
      },
    },
  });

  beforeEach(() => {
    // TODO provide base render util with providers, transfer this definition to appropriate file
    inversifyContainer = createTestContainer();

    (fetchProduct as jest.Mock).mockResolvedValue(mockProduct());
  });

  it('should render successfully', async () => {
    // TODO provide base render util with providers
    const { baseElement, getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <Provider container={inversifyContainer}>
          <SingleProductPage />
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(baseElement).toBeTruthy();

      const productTitle = getByTestId('product_name');

      expect(productTitle.textContent).toEqual(mockProduct().name);
    });
  });
});
