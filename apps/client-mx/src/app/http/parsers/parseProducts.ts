import { APIProduct, Product } from '../../types';

export const parseProducts = (products: APIProduct[]): Product[] => {
  return products.map((product) => ({
    guid: product.guid,
    title: product.title,
    picture: product.picture,
    company: product.company,
    about: product.about,
    registered: product.registered,
    tags: product?.tags && product.tags.map((tag) => tag),
    price: product.price,
    productCondition: product?.product_condition,
  }));
};
