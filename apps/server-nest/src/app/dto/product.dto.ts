import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '@demo-t3/models';

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
