import { ApiProduct } from '@demo-t3/models';

export type CartItem = {
  product: ApiProduct;
  quantity: number;
};

export interface ICartManager {
  cartItems: CartItem[];
  totalPrice: number;
  addProductToCart: (item: ApiProduct) => void;
  removeProductFromCart: (item: ApiProduct) => void;
  updateCartItemQuantity: (item: ApiProduct, quantity: number) => void;
  clearCart: () => void;
  getTotalProductsInCart: () => number;
  isProductInCart: (item: ApiProduct) => boolean;
  getCartItemTotalPrice: (item: CartItem) => number;
}
