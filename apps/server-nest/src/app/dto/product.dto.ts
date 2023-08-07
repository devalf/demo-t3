import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product, ProductCondition, ProductDetailed } from '@demo-t3/models';

export class ProductDTO implements Product {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  tags?: string[];

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  company: string;

  @ApiProperty()
  picture: string;

  @ApiPropertyOptional()
  about: string;
}

export class ProductDetailedDTO extends ProductDTO implements ProductDetailed {
  @ApiPropertyOptional()
  specification?: string;

  @ApiProperty()
  condition: ProductCondition;

  @ApiPropertyOptional()
  seller?: string;

  @ApiPropertyOptional()
  warranty?: string;

  @ApiPropertyOptional()
  color?: string;
}
