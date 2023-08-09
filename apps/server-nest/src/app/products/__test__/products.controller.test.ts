import { mockApiProductList, mockProductDetailed } from '@demo-t3/dummy-data';

import { ProductsController } from '../products.controller';
import { ProductsService } from '../products.service';
import { ProductQueryParamsDto } from '../../dto';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  beforeEach(async () => {
    productsService = new ProductsService(undefined);
    productsController = new ProductsController(productsService);
  });

  test('should return an list of products', async () => {
    const result = mockApiProductList();

    jest.spyOn(productsService, 'getProducts').mockResolvedValue(result);

    expect(
      await productsController.getProducts({} as ProductQueryParamsDto)
    ).toBe(result);
  });

  test('should return a product', async () => {
    const result = mockProductDetailed();

    jest.spyOn(productsService, 'getProduct').mockResolvedValue(result);

    expect(await productsController.getProduct('1')).toBe(result);
  });
});
