import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { mockProductList } from '@demo-t3/dummy-data';

import { providers } from '../../constants';

import { productSchema } from './schemas';

export const databaseProviders = [
  {
    provide: providers.database,
    useFactory: async (): Promise<RxDatabase> => {
      try {
        addRxPlugin(RxDBAttachmentsPlugin);

        const db = await createRxDatabase({
          name: 'in-memory-rxdb',
          storage: getRxStorageMemory(),
        });

        await db.addCollections({
          products: {
            schema: productSchema,
          },
        });

        await db.products.bulkInsert(mockProductList(5));

        return db;
      } catch (err) {
        console.error(err);
      }
    },
  },
];
