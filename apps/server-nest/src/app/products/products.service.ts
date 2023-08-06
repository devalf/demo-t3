import { Inject, Injectable } from '@nestjs/common';
import { parseProducts } from '@demo-t3/utils';
import { ApiEntryList, Product } from '@demo-t3/models';

import { LIMIT_ITEMS, OFFSET_ITEMS, providers } from '../../constants';
import { PaginationParamsDto } from '../dto';

@Injectable()
export class ProductsService {
  constructor(@Inject(providers.database) private db) {}

  async getProducts({
    offset = OFFSET_ITEMS,
    limit = LIMIT_ITEMS,
  }: PaginationParamsDto): Promise<ApiEntryList<Product>> {
    const products = await this.db.products
      .find({
        skip: offset,
        limit,
      })
      .exec();

    const total = await this.db.products.count().exec();

    return {
      meta: {
        total,
      },
      entries: parseProducts(products),
    };
  }
}
