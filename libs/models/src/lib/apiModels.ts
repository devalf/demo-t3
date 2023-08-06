import { ApiListMeta } from './general';

export type ApiEntryList<Entry> = {
  meta: ApiListMeta;
  entries: Entry[];
};
