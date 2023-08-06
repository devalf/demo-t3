import { ApiEntryList, ApiListMeta } from '@demo-t3/models';
import { ApiProperty } from '@nestjs/swagger';

import { ProductDTO } from './product.dto';

export class ApiListMetaDTO implements ApiListMeta {
  @ApiProperty()
  total: number;
}

export class ApiProductListDTO implements ApiEntryList<ProductDTO> {
  @ApiProperty()
  meta: ApiListMetaDTO;

  @ApiProperty({
    type: [ProductDTO],
  })
  entries: [ProductDTO];
}
