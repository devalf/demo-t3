import { mockProduct } from '@demo-t3/dummy-data';

import { CartManager } from '../cartManager';

describe('CartManager testing', () => {
  let instance: CartManager;

  beforeEach(() => {
    instance = new CartManager();
  });

  it('it should be initial empty cartItems array', () => {
    expect(instance.cartItems).toEqual([]);
  });

  it('should be zero initial totalPrice', () => {
    expect(instance.totalPrice).toEqual(0);
  });

  it('should add product to cart, and throw an error if product already in the cart', () => {
    const product = mockProduct();

    instance.addProductToCart(product);

    expect(instance.cartItems).toEqual([{ product, quantity: 1 }]);

    expect(() => instance.addProductToCart(product)).toThrow(
      'Product is already in cart'
    );
  });

  it('should remove product from cart, and throw an error it is not there', () => {
    const product = mockProduct();

    instance.addProductToCart(product);

    expect(instance.cartItems).toEqual([{ product, quantity: 1 }]);

    instance.removeProductFromCart(product);

    expect(instance.cartItems).toEqual([]);

    expect(() => instance.removeProductFromCart(product)).toThrow(
      'Product is not in cart'
    );
  });

  it('should update product in the cart, and throw error if it is not there', () => {
    const product = mockProduct();

    instance.addProductToCart(product);

    expect(instance.cartItems).toEqual([{ product, quantity: 1 }]);

    instance.updateCartItemQuantity(product, 2);

    expect(instance.cartItems).toEqual([{ product, quantity: 2 }]);

    instance.removeProductFromCart(product);

    expect(() => instance.updateCartItemQuantity(product, 3)).toThrow(
      'Product is not in cart'
    );
  });

  it('should clear cart', () => {
    const product = mockProduct();

    instance.addProductToCart(product);

    expect(instance.cartItems).toEqual([{ product, quantity: 1 }]);

    instance.clearCart();

    expect(instance.cartItems).toEqual([]);
  });

  it('should get total products in cart', () => {
    const product = mockProduct({ id: 'a' });
    const product2 = mockProduct({ id: 'b' });

    instance.addProductToCart(product);
    instance.addProductToCart(product2);

    expect(instance.getTotalProductsInCart()).toEqual(2);
  });

  it('should detect if product in the cart properly', () => {
    const product = mockProduct({ id: 'a' });
    const product2 = mockProduct({ id: 'b' });

    instance.addProductToCart(product);

    expect(instance.isProductInCart(product)).toEqual(true);
    expect(instance.isProductInCart(product2)).toEqual(false);
  });

  it('should get total price properly', () => {
    const product = mockProduct({ id: 'a', price: 100 });
    const product2 = mockProduct({ id: 'b', price: 200 });

    instance.addProductToCart(product);
    instance.addProductToCart(product2);

    expect(instance.totalPrice).toEqual(300);
  });
});
