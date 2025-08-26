import { ApiListMeta } from './general';

export type ApiEntryList<Entry> = {
  metadata: ApiListMeta;
  entries: Entry[];
};

export type ApiQueryParams = {
  offset?: string;
  limit?: string;
  sort?: 'name' | 'price' | 'company';
  order?: 'asc' | 'desc';
};

export type Dummy = string; // TODO delete me
