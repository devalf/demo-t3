import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { HttpException, HttpStatus } from '@nestjs/common';

import { ListQueryParamsDto } from './listQueryParams.dto';

export class ProductQueryParamsDto extends ListQueryParamsDto {
  @ApiPropertyOptional({
    description: 'Sort by: name, price or company',
  })
  @IsOptional()
  @Type(() => String)
  @IsIn(['name', 'price', 'company'])
  sort?: string;

  @ApiPropertyOptional({
    description: 'Sort order: asc or desc',
  })
  @IsOptional()
  @Type(() => String)
  @IsIn(['asc', 'desc'])
  @ValidateIf((o) => {
    if (o.sort === undefined && o.order) {
      throw new HttpException(
        'An `order` can be used only together with `sort`',
        HttpStatus.BAD_REQUEST
      );
    }

    return true;
  })
  order: string;
}
