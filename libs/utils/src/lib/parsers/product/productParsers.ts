import type { DBProduct, Product } from '@demo-t3/models';

export const parseProduct = (DBProductDocument: DBProduct): Product => ({
  id: DBProductDocument.id,
  name: DBProductDocument.name,
  price: DBProductDocument.price,
  tags: DBProductDocument.tags,
  timestamp: DBProductDocument.timestamp, // unfortunately, recommended by NestJS `rxdb-utils` package is outdated is not working with newer versions of RxDB, so timestamp represented here as a string
});

export const parseProducts = (DBProductDocuments: DBProduct[]): Product[] =>
  DBProductDocuments.map(parseProduct);
