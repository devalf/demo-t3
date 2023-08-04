import { Product } from '@demo-t3/models';

export const mockProduct = (overrides?: Partial<Product>): Product => ({
  id: '1',
  name: 'Product 1',
  price: 100,
  timestamp: '2023-08-01T00:00:00.000Z',
  ...overrides,
});

export const mockProductWithTags = (overrides?: Partial<Product>): Product => ({
  ...mockProduct(),
  tags: ['tag1', 'tag2'],
  ...overrides,
});

export const mockProductList = (count = 1): Product[] => {
  const list: Product[] = [];

  for (let i = 0; i < count; i++) {
    const isEven = i % 2 === 0;

    const uuid = crypto.randomUUID();
    const name = `Product name: item ${i}`;

    const product = isEven
      ? mockProduct({ id: uuid, name })
      : mockProductWithTags({ id: uuid, name });

    list.push(product);
  }

  return list;
};
