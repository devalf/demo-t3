import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import { JwtUserUtil } from '../../common/utils';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  TokenCleanupService,
  UserDeletionService,
  UserOperationPermissionService,
} from './services';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    UserDeletionService,
    TokenCleanupService,
    UserOperationPermissionService,
    JwtUserUtil,
  ],
  exports: [AuthService],
})
export class AuthModule {}
