import { Controller, Get } from '@nestjs/common';

import { ProductsService } from './products.service';

// I don't provide here any pagination, filtering, sorting, etc. because it's not the point of this demo
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }
}
