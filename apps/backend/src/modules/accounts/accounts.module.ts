// apps/backend/src/modules/accounts/accounts.module.ts
import { Module } from '@nestjs/common';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, RolesModule, AuditLogsModule],
  exports: [UsersModule, RolesModule, AuditLogsModule],
})
export class AccountsModule {}
