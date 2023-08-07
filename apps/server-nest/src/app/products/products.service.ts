import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { parseProducts } from '@demo-t3/utils';
import { ApiEntryList, Product } from '@demo-t3/models';

import { LIMIT_ITEMS, OFFSET_ITEMS, providers } from '../../constants';
import { ProductQueryParamsDto } from '../dto';

@Injectable()
export class ProductsService {
  constructor(@Inject(providers.database) private db) {}

  async getProducts({
    offset = OFFSET_ITEMS,
    limit = LIMIT_ITEMS,
    sort: sortQuery,
    order = 'asc',
  }: ProductQueryParamsDto): Promise<ApiEntryList<Product>> {
    const total = await this.db.products.count().exec();

    const requestedOffsetToBig = offset >= total;

    if (requestedOffsetToBig) {
      throw new HttpException(
        'Offset is bigger than total documents amount',
        HttpStatus.BAD_REQUEST
      );
    }

    let sort = undefined;

    if (sortQuery) {
      sort = [
        {
          [sortQuery]: order,
        },
      ];
    }

    const products = await this.db.products
      .find({
        skip: offset,
        limit,
        sort,
      })
      .exec();

    return {
      metadata: {
        total,
        offset,
        limit,
      },
      entries: parseProducts(products),
    };
  }
}
