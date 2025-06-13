import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './modules/auth/auth.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';

const { NX_PUBLIC_JWT_SECRET } = process.env;

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: NX_PUBLIC_JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    AuthModule,
    HealthCheckModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
