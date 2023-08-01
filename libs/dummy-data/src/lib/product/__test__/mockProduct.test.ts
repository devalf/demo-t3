import { mockProduct, mockProductWithTags } from '../mockProduct';

describe('Testing `mockProduct`', () => {
  test('should return correct minimal object', () => {
    expect(mockProduct()).toEqual({
      id: '1',
      name: 'Product 1',
      price: 100,
      timestamp: new Date('2023-08-01'),
    });
  });

  test('should return correct object with tags', () => {
    expect(mockProductWithTags()).toEqual({
      id: '1',
      name: 'Product 1',
      price: 100,
      tags: ['tag1', 'tag2'],
      timestamp: new Date('2023-08-01'),
    });
  });

  test('should return correct object with overrides', () => {
    expect(mockProduct({ id: '2' })).toEqual({
      id: '2',
      name: 'Product 1',
      price: 100,
      timestamp: new Date('2023-08-01'),
    });
  });

  test('should return correct object with tags and overrides', () => {
    expect(mockProductWithTags({ id: '2', tags: ['tag3'] })).toEqual({
      id: '2',
      name: 'Product 1',
      price: 100,
      tags: ['tag3'],
      timestamp: new Date('2023-08-01'),
    });
  });
});
