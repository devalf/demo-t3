import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from '../../common/guards';
import { AuthModule } from '../../auth/auth.module';

import { TestorController } from './testor.controller';

@Module({
  imports: [AuthModule],
  controllers: [TestorController],
  providers: [JwtAuthGuard, JwtService],
})
export class TestorModule {}
