import { ApiListMeta } from './general';

export type ApiEntryList<Entry> = {
  metadata: ApiListMeta;
  entries: Entry[];
};
