// apps/backend/src/modules/accounts/accounts.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { RolesRepository } from './roles/roles.repository';
import { AuditLogsController } from './audit-logs/audit-logs.controller';
import { AuditLogsService } from './audit-logs/audit-logs.service';
import { AuditLogsRepository } from './audit-logs/audit-logs.repository';

@Module({
  controllers: [UsersController, RolesController, AuditLogsController],
  providers: [
    UsersService,
    UsersRepository,
    RolesService,
    RolesRepository,
    AuditLogsService,
    AuditLogsRepository,
  ],
})
export class AccountsModule {}
