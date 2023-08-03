import type { DBProduct, Product } from '@demo-t3/models';

export const parseProduct = (DBProductDocument: DBProduct): Product => ({
  id: DBProductDocument.id,
  name: DBProductDocument.name,
  price: DBProductDocument.price,
  tags: DBProductDocument.tags,
  timestamp: DBProductDocument.timestamp,
});

export const parseProducts = (DBProductDocuments: DBProduct[]): Product[] =>
  DBProductDocuments.map(parseProduct);
