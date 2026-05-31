// apps/backend/src/modules/accounts/audit-logs/audit-logs.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { AuditLogsService } from './audit-logs.service';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import {
  auditLogQuerySchema,
  type AuditLogQuery,
} from '@repo/validators/accounts';

@ApiTags('accounts/audit-logs')
@ApiBearerAuth()
@Controller({ path: 'accounts/audit-logs', version: '1' })
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs' })
  @UserHasPermission({ permission: { 'audit-logs': ['read'] } })
  findAll(
    @Query(new ZodValidationPipe(auditLogQuerySchema)) query: AuditLogQuery,
  ) {
    return this.auditLogsService.findAll(query);
  }
}
