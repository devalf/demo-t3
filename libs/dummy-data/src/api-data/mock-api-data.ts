import { ApiEntryList, ApiListMeta, ApiProduct } from '@demo-t3/models';

import { mockProduct } from '../product';

export const mockApiListMeta = (): ApiListMeta => ({
  total: 15,
  limit: 10,
  offset: 0,
});

export const mockApiProductList = (): ApiEntryList<ApiProduct> => ({
  metadata: mockApiListMeta(),
  entries: [mockProduct()],
});
