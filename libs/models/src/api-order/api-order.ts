import { ID } from '../../src';

export type ApiOrderIem = {
  id: ID;
  quantity: number;
};

export type ApiOrderParams = {
  items: ApiOrderIem[];
};
