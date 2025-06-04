import { Product } from '@demo-t3/models';

export type CartItem = {
  product: Product;
  quantity: number;
};

export interface ICartManager {
  cartItems: CartItem[];
  totalPrice: number;
  addProductToCart: (item: Product) => void;
  removeProductFromCart: (item: Product) => void;
  updateCartItemQuantity: (item: Product, quantity: number) => void;
  clearCart: () => void;
  getTotalProductsInCart: () => number;
  isProductInCart: (item: Product) => boolean;
  getCartItemTotalPrice: (item: CartItem) => number;
}
