import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenGuard } from '../../common/guards';
import { AuthModule } from '../auth/auth.module';

import { UserController } from './user.controller';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [AccessTokenGuard, JwtService],
})
export class UserModule {}
