import { Inject, Injectable } from '@nestjs/common';
import { Product } from '@demo-t3/models';
import { parseProducts } from '@demo-t3/utils';

import { providers } from '../../constants';

@Injectable()
export class ProductsService {
  constructor(@Inject(providers.database) private db) {}

  async getProducts(): Promise<Product[]> {
    const products = await this.db.products.find().exec();

    return parseProducts(products);
  }
}
