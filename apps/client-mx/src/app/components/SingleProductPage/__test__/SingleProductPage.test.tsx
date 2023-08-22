import { waitFor } from '@testing-library/react';
import { Container } from 'inversify';
import { mockProduct } from '@demo-t3/dummy-data';
import { renderApp } from '@demo-t3/utils-ui';
import { FC, PropsWithChildren } from 'react';

import { SingleProductPage } from '../SingleProductPage';
import { createTestContainer } from '../../../bootstrap/ioc/test.helpers';
import { fetchProduct } from '../../../repository';
import { Provider } from '../../../bootstrap/ioc/InversifyContext';

jest.mock('../../../repository');

describe('SingleProductPage', () => {
  let inversifyContainer: Container;
  let InversifyProviderMock: FC<PropsWithChildren>;

  beforeEach(() => {
    inversifyContainer = createTestContainer();

    InversifyProviderMock = ({ children }) => (
      <Provider container={inversifyContainer}>{children}</Provider>
    );

    (fetchProduct as jest.Mock).mockResolvedValue(mockProduct());
  });

  it('should render successfully', async () => {
    const { baseElement, getByTestId } = renderApp(<SingleProductPage />, {
      wrapper: InversifyProviderMock,
    });

    await waitFor(() => {
      expect(baseElement).toBeTruthy();

      const productTitle = getByTestId('product_name');

      expect(productTitle.textContent).toEqual(mockProduct().name);
    });
  });
});
