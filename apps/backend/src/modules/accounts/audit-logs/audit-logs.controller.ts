// apps/backend/src/modules/accounts/audit-logs/audit-logs.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { Permissions } from '@/auth/permission';
import { ZodQuery } from '@/common/decorators/zod.decorators';
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import { AuditLogsService } from './audit-logs.service';
import {
  auditLogsPaginatedResponseSchema,
  auditLogQuerySchema,
  type AuditLogQuery,
  type AuditLogsPaginatedResponse,
} from '@repo/validators/accounts';

@ApiTags('accounts/audit-logs')
@ApiBearerAuth()
@Controller({ path: 'accounts/audit-logs', version: '1' })
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs' })
  @ApiZodOkResponse(auditLogsPaginatedResponseSchema)
  @UserHasPermission({ permission: Permissions.auditLogs.read })
  findAll(
    @ZodQuery(auditLogQuerySchema) query: AuditLogQuery,
  ): Promise<AuditLogsPaginatedResponse> {
    return this.auditLogsService.findAll(query);
  }
}
