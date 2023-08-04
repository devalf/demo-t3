import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';

// I don't provide any authorization or authentication for this API, because it's not the point of this demo
@Module({
  imports: [DatabaseModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
