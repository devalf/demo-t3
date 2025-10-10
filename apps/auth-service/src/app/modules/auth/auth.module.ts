import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@demo-t3/utils-nest';

import { PrismaService } from '../prisma/prisma.service';
import { JwtUserUtil } from '../../common/utils';
import { MessagingModule } from '../messaging';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  EmailVerificationTokenService,
  TokenCleanupService,
  UserDeletionService,
  UserOperationPermissionService,
} from './services';

@Module({
  imports: [ScheduleModule.forRoot(), RedisModule, MessagingModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    UserDeletionService,
    TokenCleanupService,
    UserOperationPermissionService,
    EmailVerificationTokenService,
    JwtUserUtil,
  ],
  exports: [AuthService],
})
export class AuthModule {}
