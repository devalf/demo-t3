import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { ApiOrderCreatedDTO } from '../../dto';

@Injectable()
export class OrderService {
  /**
   * Simulation of an order creation
   * Simulation of a long-running operation
   * */
  async createOrder(): Promise<ApiOrderCreatedDTO> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      id: faker.number.int({ min: 1000, max: 9999 }),
    };
  }
}
