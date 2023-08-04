import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDTO {
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
}
