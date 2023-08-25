import { ICartManager } from '../interfaces';

export const createCartManagerMock = (): ICartManager => ({
  cartItems: [],
  totalPrice: 0,
  addProductToCart: () => undefined,
  removeProductFromCart: () => undefined,
  updateCartItemQuantity: () => undefined,
  clearCart: () => undefined,
  getTotalProductsInCart: () => 0,
  isProductInCart: () => false,
});
