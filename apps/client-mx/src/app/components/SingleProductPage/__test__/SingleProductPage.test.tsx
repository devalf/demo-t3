import { waitFor } from '@testing-library/react';
import { Container } from 'inversify';
import { mockProduct, mockProductWithTags } from '@demo-t3/dummy-data';
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

  it('should render page successfully', async () => {
    const { baseElement, getByTestId } = renderApp(<SingleProductPage />, {
      wrapper: InversifyProviderMock,
    });

    const mockProductObject = mockProduct();

    await waitFor(() => {
      expect(baseElement).toBeTruthy();

      const productTitle = getByTestId('product_name');
      const productAbout = getByTestId('product_about');
      const productPrice = getByTestId('product_price');
      const productImage = getByTestId('product_picture');
      const productCompany = getByTestId('product_company');

      expect(productTitle.textContent).toEqual(mockProductObject.name);
      expect(productAbout.textContent).toEqual(mockProductObject.about);
      expect(productPrice.textContent).toContain(
        mockProductObject.price.toString()
      );
      expect(productImage.getAttribute('src')).toEqual(expect.any(String));
      expect(productCompany.textContent).toEqual(mockProductObject.company);

      expect(() => getByTestId('product_tags_label')).toThrow();
      expect(() => getByTestId('product_tags')).toThrow();
    });
  });

  it('should render page successfully with tags', async () => {
    (fetchProduct as jest.Mock).mockResolvedValue(mockProductWithTags());

    const { baseElement, getByTestId } = renderApp(<SingleProductPage />, {
      wrapper: InversifyProviderMock,
    });

    const mockProductObject = mockProductWithTags();

    await waitFor(() => {
      expect(baseElement).toBeTruthy();

      const productTitle = getByTestId('product_name');
      const productAbout = getByTestId('product_about');
      const productPrice = getByTestId('product_price');
      const productImage = getByTestId('product_picture');
      const productCompany = getByTestId('product_company');
      const productTagsLabel = getByTestId('product_tags_label');
      const productTags = getByTestId('product_tags');

      expect(productTitle.textContent).toEqual(mockProductObject.name);
      expect(productAbout.textContent).toEqual(mockProductObject.about);
      expect(productPrice.textContent).toContain(
        mockProductObject.price.toString()
      );
      expect(productImage.getAttribute('src')).toEqual(expect.any(String));
      expect(productCompany.textContent).toEqual(mockProductObject.company);
      expect(productTagsLabel.textContent).toEqual('Tags');
      expect(productTags.textContent).toEqual(
        mockProductObject.tags!.join(', ')
      );
    });
  });
});
