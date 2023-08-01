import { Inject, Injectable } from '@nestjs/common';

import { providers } from '../constants';

@Injectable()
export class AppService {
  constructor(@Inject(providers.database) private db) {}

  async getData(): Promise<{ message: string }> {
    const products = await this.db.products.find().exec();

    console.log({ products });

    return { message: 'Hello API' };
  }
}
