// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { AccountsModule } from './modules/accounts/accounts.module';

@Module({
  imports: [AuthModule, HealthModule, AccountsModule],
})
export class AppModule {}
