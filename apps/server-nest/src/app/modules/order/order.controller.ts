import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';

@ApiTags('Order creation | SIMULATION')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder() {
    return this.orderService.createOrder();
  }
}
