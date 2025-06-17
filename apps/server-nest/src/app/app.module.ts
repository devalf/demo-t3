import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { OrderModule } from './modules/order/order.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ProductsModule,
    OrderModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
