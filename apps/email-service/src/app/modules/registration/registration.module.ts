import { Module } from '@nestjs/common';

import { EmailModule } from '../email';

import { RegistrationEventsController } from './registration-events.controller';

@Module({
  imports: [EmailModule],
  controllers: [RegistrationEventsController],
})
export class RegistrationModule {}
