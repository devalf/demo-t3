import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  ApiProductListDTO,
  ProductDetailedDTO,
  ProductQueryParamsDto,
} from '../dto';

import { ProductsService } from './products.service';

@ApiTags('Product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'The products have been successfully retrieved.',
    type: ApiProductListDTO,
  })
  @Get()
  getProducts(@Query() params: ProductQueryParamsDto) {
    return this.productsService.getProducts(params);
  }

  @ApiResponse({
    status: 200,
    description: 'The detailed product has been successfully retrieved.',
    type: ProductDetailedDTO,
  })
  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }
}
