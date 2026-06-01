// apps/backend/src/common/common.module.ts
import { AuditLogsModule } from '@/modules/accounts/audit-logs/audit-logs.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

@Module({
  imports: [AuditLogsModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [AuditLogsModule],
})
export class CommonModule {}
