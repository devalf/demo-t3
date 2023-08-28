import { renderApp } from '@demo-t3/utils-ui';
import { Container } from 'inversify';
import { FC, PropsWithChildren } from 'react';
import { mockProduct } from '@demo-t3/dummy-data';
import { faker } from '@faker-js/faker';
import * as router from 'react-router';
import { generatePath } from 'react-router-dom';
import { fireEvent } from '@testing-library/react';

import { CartForm } from '../CartForm';
import { createTestContainer } from '../../../bootstrap/ioc/test.helpers';
import { Provider } from '../../../bootstrap/ioc/InversifyContext';
import { DependencyType } from '../../../bootstrap/ioc/DependencyType';
import { routes } from '../../../constants';

describe('Testing CartFrom', () => {
  let inversifyContainer: Container;
  let InversifyProviderMock: FC<PropsWithChildren>;

  beforeEach(() => {
    inversifyContainer = createTestContainer();

    InversifyProviderMock = ({ children }) => (
      <Provider container={inversifyContainer}>{children}</Provider>
    );
  });

  it('Should render `empty` cart list', () => {
    const { getByTestId } = renderApp(<CartForm />, {
      wrapper: InversifyProviderMock,
    });

    const cartItemRow = getByTestId('cart_total_price');

    expect(() => getByTestId('cart_item_row_0')).toThrow();

    expect(cartItemRow.textContent).toEqual('$0');
  });

  it('Should render three cart items and total price should match expectations', () => {
    inversifyContainer.rebind(DependencyType.CartManager).toConstantValue({
      cartItems: Array.from({ length: 3 }, () => ({
        product: mockProduct({ id: faker.string.uuid() }),
        quantity: 1,
      })),
      totalPrice: 300,
      getCartItemTotalPrice: () => 100,
    });

    const { container, getByTestId } = renderApp(<CartForm />, {
      wrapper: InversifyProviderMock,
    });

    const allRows = container.querySelectorAll(
      '[data-testid^="cart_item_row_"]'
    );

    expect(allRows.length).toEqual(3);

    expect(getByTestId('cart_total_price').textContent).toEqual('$300');
  });

  it('should render one item and call `removeProductFromCart` when click on `remove` button', () => {
    const removeProductFromCartMock = jest.fn();
    const productMockId = faker.string.uuid();
    const mockedProduct = mockProduct({ id: productMockId });

    inversifyContainer.rebind(DependencyType.CartManager).toConstantValue({
      cartItems: [
        {
          product: mockProduct({ id: productMockId }),
          quantity: 1,
        },
      ],
      totalPrice: 100,
      getCartItemTotalPrice: () => 100,
      removeProductFromCart: removeProductFromCartMock,
    });

    const { getByTestId } = renderApp(<CartForm />, {
      wrapper: InversifyProviderMock,
    });

    const removeButton = getByTestId('cart_item_remove_btn');

    removeButton.click();

    expect(removeProductFromCartMock).toHaveBeenCalledWith({
      about: mockedProduct.about,
      company: mockedProduct.company,
      id: productMockId,
      name: mockedProduct.name,
      picture: expect.any(String),
      price: mockedProduct.price,
      timestamp: mockedProduct.timestamp,
    });
  });

  it('should call navigate to product page when click on appropriate block', () => {
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

    const productMockId = faker.string.uuid();

    const pathToProductPage = generatePath(routes.product, {
      id: productMockId,
    });

    inversifyContainer.rebind(DependencyType.CartManager).toConstantValue({
      cartItems: [
        {
          product: mockProduct({ id: productMockId }),
          quantity: 1,
        },
      ],
      totalPrice: 100,
      getCartItemTotalPrice: () => 100,
    });

    const { getByTestId } = renderApp(<CartForm />, {
      wrapper: InversifyProviderMock,
    });

    const productBlock = getByTestId('cart_item_product_picture');

    productBlock.click();

    expect(navigate).toHaveBeenCalledWith(pathToProductPage);
  });

  it('should call `updateCartItemQuantity` when update quantity input', () => {
    const updateCartItemQuantityMock = jest.fn();

    inversifyContainer.rebind(DependencyType.CartManager).toConstantValue({
      cartItems: [
        {
          product: mockProduct({ id: faker.string.uuid() }),
          quantity: 1,
        },
      ],
      totalPrice: 100,
      getCartItemTotalPrice: () => 100,
      updateCartItemQuantity: updateCartItemQuantityMock,
    });

    const { getByTestId } = renderApp(<CartForm />, {
      wrapper: InversifyProviderMock,
    });

    const quantityInput = getByTestId('cart_item_product_quantity');

    fireEvent.change(quantityInput, { target: { value: 5 } });

    expect(updateCartItemQuantityMock).toHaveBeenCalledWith(
      expect.any(Object),
      5
    );
  });
});
