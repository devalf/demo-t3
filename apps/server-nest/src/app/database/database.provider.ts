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

        // ! important notice, I don't implement TypeORM or another ORM in this project,
        // since I need to use RxDB as simple `in-memory` database,
        // and I can be really sure that these tools are compatible with each other.
        // and for the same reason I do not use `nestjs-seeder` here as well

        await db.products.bulkInsert(mockProductList(27));

        return db;
      } catch (err) {
        console.error(err);
      }
    },
  },
];
