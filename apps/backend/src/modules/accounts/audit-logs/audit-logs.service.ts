// apps/backend/src/modules/accounts/audit-logs/audit-logs.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository';
import {
  auditLogsPaginatedResponseSchema,
  type AuditLogsPaginatedResponse,
} from '@repo/validators/accounts';
import type {
  AuditLogQuery,
  CreateAuditLogInput,
} from '@repo/validators/accounts';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async findAll(query: AuditLogQuery): Promise<AuditLogsPaginatedResponse> {
    const logs = await this.auditLogsRepository.findAll(query);
    return auditLogsPaginatedResponseSchema.parse(logs);
  }

  async create(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.auditLogsRepository.create(input);
    } catch (err) {
      this.logger.error('Failed to write audit log', err);
    }
  }
}
