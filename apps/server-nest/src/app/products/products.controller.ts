import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductDTO } from '../dto';

import { ProductsService } from './products.service';

// I don't provide here any pagination, filtering, sorting, etc. because it's not the point of this demo

@ApiTags('Product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'The products have been successfully retrieved.',
    type: [ProductDTO],
  })
  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }
}
