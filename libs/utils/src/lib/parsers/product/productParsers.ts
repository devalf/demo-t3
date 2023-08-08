import type {
  DBProduct,
  DBProductDetailed,
  Product,
  ProductDetailed,
} from '@demo-t3/models';

export const parseProduct = (dbProductDocument: DBProduct): Product => ({
  id: dbProductDocument.id,
  name: dbProductDocument.name,
  price: dbProductDocument.price,
  tags: dbProductDocument.tags,
  timestamp: dbProductDocument.timestamp, // unfortunately, recommended by NestJS `rxdb-utils` package is outdated is not working with newer versions of RxDB, so timestamp represented here as a string
  picture: dbProductDocument.picture,
  company: dbProductDocument.company,
  about: dbProductDocument.about,
});

export const parseProducts = (dbProductDocuments: DBProduct[]): Product[] =>
  dbProductDocuments.map(parseProduct);

export const parseProductDetailed = (
  dbProductDetailedDocument: DBProductDetailed
): ProductDetailed => ({
  ...parseProduct(dbProductDetailedDocument),
  specification: dbProductDetailedDocument.specification,
  condition: dbProductDetailedDocument.condition,
  seller: dbProductDetailedDocument.seller,
  warranty: dbProductDetailedDocument.warranty,
  color: dbProductDetailedDocument.color,
});
