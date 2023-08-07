import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
    const total = await this.db.products.count().exec();

    const requestedOffsetToBig = offset >= total;

    if (requestedOffsetToBig) {
      throw new HttpException(
        'Offset is bigger than total documents amount',
        HttpStatus.BAD_REQUEST
      );
    }

    const products = await this.db.products
      .find({
        skip: offset,
        limit,
      })
      .exec();

    return {
      metadata: {
        total,
      },
      entries: parseProducts(products),
    };
  }
}
