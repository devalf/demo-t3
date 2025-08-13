import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenGuard } from '../../common/guards';
import { AuthModule } from '../auth/auth.module';

import { TestorController } from './testor.controller';

@Module({
  imports: [AuthModule],
  controllers: [TestorController],
  providers: [AccessTokenGuard, JwtService],
})
export class TestorModule {}
