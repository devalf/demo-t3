import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';

// I don't provide any authorization or authentication for this API, because it's not the point of this demo
@Module({
  imports: [DatabaseModule, ProductsModule],
})
export class AppModule {}
