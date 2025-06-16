import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from '../../common/guards';
import { AuthModule } from '../../auth/auth.module';

import { UserController } from './user.controller';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [JwtAuthGuard, JwtService],
})
export class UserModule {}
