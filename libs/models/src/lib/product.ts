import { ID } from './general';

export type Product = {
  id: ID;
  name: string;
  price: number;
  tags?: string[];
  timestamp: string;
};

export type DBProduct = Record<string, unknown> & Product;
