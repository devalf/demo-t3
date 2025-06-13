import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule, ProductsModule, OrderModule, AuthModule],
})
export class AppModule {}
