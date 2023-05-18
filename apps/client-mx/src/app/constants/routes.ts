const PRODUCT = 'product';
export const singleProductPageRoute = `/${PRODUCT}/:id`;
export const buildLinkToProductPage = (id: string): string =>
  `/${PRODUCT}/${id}`;
export const orderPageRoute = '/order';
