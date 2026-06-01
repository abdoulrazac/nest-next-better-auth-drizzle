// apps/backend/src/modules/accounts/audit-logs/audit-logs.controller.ts
import { Permissions } from '@/auth/permission';
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import { ZodQuery } from '@/common/decorators/zod.decorators';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  auditLogQuerySchema,
  auditLogsPaginatedResponseSchema,
  type AuditLogQuery,
  type AuditLogsPaginatedResponse,
} from '@repo/validators/accounts';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { AuditLogsService } from './audit-logs.service';

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
