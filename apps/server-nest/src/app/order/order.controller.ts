import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';

/**
 *  I don't provide here any Swagger documentation, because it's not the point of this demo
 *  and the codebase doesn't have necessary business logic to handle Users and Orders data
 */

@ApiTags('Order creation | SIMULATION')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder() {
    return this.orderService.createOrder();
  }
}
