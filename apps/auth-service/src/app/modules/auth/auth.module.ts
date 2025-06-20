import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserDeletionService } from './services';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UserDeletionService],
  exports: [AuthService],
})
export class AuthModule {}
