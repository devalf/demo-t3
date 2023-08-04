import { ID } from './general';

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
