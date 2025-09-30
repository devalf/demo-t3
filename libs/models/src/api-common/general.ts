export type ID = string;

export type ApiListMeta = {
  total: number;
  limit: number;
  offset: number;
};

export type ProductCondition = 'new' | 'used' | 'refurbished';

export type Dummy = string; // need this line to trigger `affected changes` detection
