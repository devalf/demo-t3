import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { OrderModule } from './order/order.module';

// I don't provide any authorization or authentication for this API, because it's not the point of this demo
@Module({
  imports: [DatabaseModule, ProductsModule, OrderModule],
})
export class AppModule {}
