import { ID, ProductCondition } from './general';

export type Product = {
  id: ID;
  name: string;
  price: number;
  tags?: string[];
  timestamp: string;
  picture: string;
  company: string;
  about?: string;
};

export type DBProduct = Record<string, unknown> & Product;

export type ProductDetailed = Product & {
  specification?: string;
  condition: ProductCondition;
  seller?: string;
  warranty?: string;
  color?: string;
};

export type DBProductDetailed = Record<string, unknown> & ProductDetailed;
