import { Product } from '@demo-t3/models';

export const mockProduct = (overrides?: Partial<Product>): Product => ({
  id: '1',
  name: 'Product 1',
  price: 100,
  timestamp: new Date('2023-08-01'),
  ...overrides,
});

export const mockProductWithTags = (overrides?: Partial<Product>): Product => ({
  ...mockProduct(),
  tags: ['tag1', 'tag2'],
  ...overrides,
});
