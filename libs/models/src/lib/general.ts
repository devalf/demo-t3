export type ID = string;

export type ApiListMeta = {
  total: number;
  limit: number;
  offset: number;
};

export type ProductCondition = 'new' | 'used' | 'refurbished';
