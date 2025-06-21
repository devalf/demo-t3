import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenCleanupService, UserDeletionService } from './services';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    UserDeletionService,
    TokenCleanupService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
