import {
  mockProduct,
  mockProductList,
  mockProductWithTags,
} from '../mock-product';

describe('Testing `mockProduct`', () => {
  test('should return correct minimal object', () => {
    expect(mockProduct()).toEqual({
      id: '1',
      name: 'Product 1',
      price: 100,
      timestamp: '2023-08-01T00:00:00.000Z',
      picture: expect.any(String),
      company: 'Company 1',
      about: 'About 1',
    });
  });

  test('should return correct object with tags', () => {
    expect(mockProductWithTags()).toEqual({
      id: '1',
      name: 'Product 1',
      price: 100,
      tags: ['tag1', 'tag2'],
      timestamp: '2023-08-01T00:00:00.000Z',
      picture: expect.any(String),
      company: 'Company 1',
      about: 'About 1',
    });
  });

  test('should return correct object with overrides', () => {
    expect(mockProduct({ id: '2' })).toEqual({
      id: '2',
      name: 'Product 1',
      price: 100,
      timestamp: '2023-08-01T00:00:00.000Z',
      picture: expect.any(String),
      company: 'Company 1',
      about: 'About 1',
    });
  });

  test('should return correct object with tags and overrides', () => {
    expect(mockProductWithTags({ id: '2', tags: ['tag3'] })).toEqual({
      id: '2',
      name: 'Product 1',
      price: 100,
      tags: ['tag3'],
      timestamp: '2023-08-01T00:00:00.000Z',
      picture: expect.any(String),
      company: 'Company 1',
      about: 'About 1',
    });
  });

  test('should return correct list of objects', () => {
    const mockProductListResult = mockProductList(3);

    expect(mockProductListResult.length).toEqual(3);

    const [first, second, third] = mockProductListResult;

    expect(first).not.toHaveProperty('tags');
    expect(second).toHaveProperty('tags');
    expect(third).not.toHaveProperty('tags');
  });
});
