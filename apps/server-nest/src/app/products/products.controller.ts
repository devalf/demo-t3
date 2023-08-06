import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiProductListDTO, PaginationParamsDto } from '../dto';

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
  getProducts(@Query() params: PaginationParamsDto) {
    return this.productsService.getProducts(params);
  }
}
