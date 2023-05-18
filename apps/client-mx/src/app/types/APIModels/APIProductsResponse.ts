import { APIProduct } from './APIProduct';

export type APIProductsResponse = {
  data: {
    products: APIProduct[];
    totalCount: number;
  };
  status: number;
};
