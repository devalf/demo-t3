import { renderApp } from '@demo-t3/utils-ui';
import { Container } from 'inversify';
import { FC, PropsWithChildren } from 'react';
import { mockProduct } from '@demo-t3/dummy-data';
import { faker } from '@faker-js/faker';
import * as router from 'react-router';
import { generatePath } from 'react-router-dom';
import { fireEvent, waitFor } from '@testing-library/react';

import { CartForm } from '../cart-form';
import {
  createTestContainer,
  createInversifyProviderMock,
} from '../../../bootstrap/ioc/test.helpers';
import { DependencyType } from '../../../bootstrap/ioc/dependency-type';
import { routes } from '../../../constants';
import { createOrder } from '../../../repository';

jest.mock('../../../repository');

describe('Testing CartFrom', () => {
  let inversifyContainer: Container;
  let InversifyProviderMock: FC<PropsWithChildren>;

  beforeEach(() => {
    inversifyContainer = createTestContainer();
    InversifyProviderMock = createInversifyProviderMock(inversifyContainer);
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

  it('should send request to create order and handle success request properly', async () => {
    const clearCartMock = jest.fn();
    const navigateMock = jest.fn();
    const mockOrderId = 1234;

    (createOrder as jest.Mock).mockResolvedValue({ id: mockOrderId });

    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigateMock);

    inversifyContainer.rebind(DependencyType.CartManager).toConstantValue({
      cartItems: [
        {
          product: mockProduct({ id: faker.string.uuid() }),
          quantity: 1,
        },
      ],
      totalPrice: 100,
      getCartItemTotalPrice: () => 100,
      clearCart: clearCartMock,
    });

    const { getByTestId } = renderApp(<CartForm />, {
      wrapper: InversifyProviderMock,
    });

    const searchParams = new URLSearchParams({ order_id: String(mockOrderId) });
    const orderSuccessPathWithParams = `${
      routes.orderSuccess
    }?${searchParams.toString()}`;

    const makeOrderButton = getByTestId('cart_make_order_btn');

    fireEvent.click(makeOrderButton);

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalled();
      expect(clearCartMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith(orderSuccessPathWithParams);
    });
  });

  it('should match all provided params on the page', () => {
    const mockedProduct = mockProduct();

    inversifyContainer.rebind(DependencyType.CartManager).toConstantValue({
      cartItems: [
        {
          product: mockedProduct,
          quantity: 4,
        },
      ],
      totalPrice: 100,
      getCartItemTotalPrice: () => 400,
    });

    const { getByTestId } = renderApp(<CartForm />, {
      wrapper: InversifyProviderMock,
    });

    const cartItemProductPicture = getByTestId('cart_item_product_picture');
    const cartItemProductName = getByTestId('cart_item_product_name');
    const cartItemProductCompany = getByTestId('cart_item_product_company');
    const cartItemProductPrice = getByTestId('cart_item_product_price');
    const cartItemProductQuantity = getByTestId('cart_item_product_quantity');
    const cartItemTotalAmountPrice = getByTestId(
      'cart_item_total_amount_price'
    );

    expect(cartItemProductPicture.getAttribute('src')).toContain(
      'https://picsum.photos/seed/'
    );

    expect(cartItemProductName.textContent).toEqual(mockedProduct.name);
    expect(cartItemProductCompany.textContent).toEqual(mockedProduct.company);
    expect(cartItemProductPrice.textContent).toEqual(
      `Product price: $${mockedProduct.price}`
    );
    expect(cartItemProductQuantity.getAttribute('value')).toEqual('4');
    expect(cartItemTotalAmountPrice.textContent).toEqual('$400');
  });
});
