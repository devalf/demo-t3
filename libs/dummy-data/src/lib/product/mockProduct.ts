import { Product, ProductDetailed } from '@demo-t3/models';
import { faker } from '@faker-js/faker';

export const mockProduct = (overrides?: Partial<Product>): Product => ({
  id: '1',
  name: 'Product 1',
  price: 100,
  timestamp: '2023-08-01T00:00:00.000Z',
  picture: 'https://picsum.photos/250/250',
  company: 'Company 1',
  about: 'About 1',
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
    const name = faker.commerce.product();
    const price = Number(faker.commerce.price({ min: 100, max: 1000 }));
    const company = faker.company.name();
    const about = faker.lorem.sentence({ min: 5, max: 20 });

    const product = mockProductDetailed(!isEven, {
      id: uuid,
      name,
      price,
      company,
      about,
    });

    list.push(product);
  }

  return list;
};

export const mockProductDetailed = (
  withTags = false,
  overrides?: Partial<ProductDetailed>
): ProductDetailed => {
  const productGenerator = withTags ? mockProductWithTags : mockProduct;

  return {
    ...productGenerator(),
    specification: faker.lorem.sentence({ min: 5, max: 10 }),
    condition: 'new',
    seller: faker.company.name(),
    color: faker.color.human(),
    ...overrides,
  };
};
