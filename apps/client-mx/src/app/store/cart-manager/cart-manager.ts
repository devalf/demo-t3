import { makeAutoObservable } from 'mobx';
import { injectable } from 'inversify';
import { ApiProduct } from '@demo-t3/models';

import { CartItem, ICartManager } from '../interfaces';

@injectable()
export class CartManager implements ICartManager {
  private productsInCart: CartItem[] = [];

  public constructor() {
    makeAutoObservable(this);
  }

  get cartItems(): CartItem[] {
    return this.productsInCart;
  }

  get totalPrice(): number {
    return this.productsInCart.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
  }

  addProductToCart = (item: ApiProduct): void => {
    if (this.isProductInCart(item)) {
      throw new Error('Product is already in cart');
    }

    this.productsInCart.push({ product: item, quantity: 1 });
  };

  removeProductFromCart = (item: ApiProduct): void => {
    const foundItem = this.productsInCart.find(
      (cartItem) => cartItem.product.id === item.id
    );

    if (!foundItem) {
      throw new Error('Product is not in cart');
    }

    this.productsInCart.splice(this.productsInCart.indexOf(foundItem), 1);
  };

  updateCartItemQuantity = (item: ApiProduct, quantity: number): void => {
    const foundItem = this.productsInCart.find(
      (cartItem) => cartItem.product.id === item.id
    );

    if (!foundItem) {
      throw new Error('Product is not in cart');
    }

    foundItem.quantity = quantity;
  };

  clearCart = (): void => {
    this.productsInCart.length = 0;
  };

  getTotalProductsInCart = () => {
    return this.productsInCart.length;
  };

  isProductInCart = (item: ApiProduct): boolean => {
    const foundItem = this.productsInCart.find(
      (cartItem) => cartItem.product.id === item.id
    );

    return !!foundItem;
  };

  getCartItemTotalPrice = (item: CartItem): number => {
    return item.product.price * item.quantity;
  };
}
