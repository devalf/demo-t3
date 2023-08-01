import { Module } from '@nestjs/common';

import { databaseProviders } from './database.provider';

@Module({
  controllers: [],
  imports: [],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
