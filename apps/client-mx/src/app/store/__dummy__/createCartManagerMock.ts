import { ICartManager } from '../interfaces';

export const createCartManagerMock = (): ICartManager => ({
  cartItems: [],
  addProductToCart: () => undefined,
  removeProductFromCart: () => undefined,
  updateCartItemQuantity: () => undefined,
  clearCart: () => undefined,
  getTotalProductsInCart: () => 0,
  calculateTotalPrice: () => 0,
  isProductInCart: () => false,
});
