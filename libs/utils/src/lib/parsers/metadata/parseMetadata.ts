import { ApiListMeta } from '@demo-t3/models';

export const parseMetadata = (metadata: ApiListMeta): ApiListMeta => ({
  total: metadata.total,
  limit: metadata.limit,
  offset: metadata.offset,
});
