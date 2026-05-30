// apps/backend/src/modules/accounts/audit-logs/audit-logs.service.ts
import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository';
import type { AuditLogQuery } from '@repo/validators/accounts';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  findAll(query: AuditLogQuery) {
    return this.auditLogsRepository.findAll(query);
  }
}
