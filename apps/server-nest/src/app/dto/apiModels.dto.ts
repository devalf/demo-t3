import { ApiEntryList, ApiListMeta } from '@demo-t3/models';
import { ApiProperty } from '@nestjs/swagger';

import { ProductDTO } from './product.dto';

export class ApiListMetaDTO implements ApiListMeta {
  @ApiProperty({})
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;
}

export class ApiProductListDTO implements ApiEntryList<ProductDTO> {
  @ApiProperty()
  metadata: ApiListMetaDTO;

  @ApiProperty({
    type: [ProductDTO],
  })
  entries: [ProductDTO];
}
