import { Product } from '@demo-t3/models';

export type CartItem = {
  product: Product;
  quantity: number;
};

export interface ICartManager {
  cartItems: CartItem[];
  addProductToCart: (item: Product) => void;
  removeProductFromCart: (item: Product) => void;
  updateCartItemQuantity: (item: Product, quantity: number) => void;
  clearCart: () => void;
  getTotalProductsInCart: () => number;
  calculateTotalPrice: () => number;
  isProductInCart: (item: Product) => boolean;
}
