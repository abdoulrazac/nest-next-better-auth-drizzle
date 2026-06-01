// apps/backend/src/modules/accounts/audit-logs/audit-logs.repository.ts
import { DATABASE_TOKEN } from '@/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import type { db as DbType } from '@repo/db';
import { auditLog } from '@repo/db';
import type {
  AuditLogQuery,
  CreateAuditLogInput,
} from '@repo/validators/accounts';
import {
  auditLogsPaginatedResponseSchema,
  type AuditLogsPaginatedResponse,
} from '@repo/validators/accounts';
import { and, count, eq, gte, lte, type SQL } from 'drizzle-orm';

type DB = typeof DbType;

@Injectable()
export class AuditLogsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  async findAll(query: AuditLogQuery): Promise<AuditLogsPaginatedResponse> {
    const { page, limit, userId, action, from, to } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (userId) conditions.push(eq(auditLog.userId, userId));
    if (action) conditions.push(eq(auditLog.action, action));
    if (from) conditions.push(gte(auditLog.createdAt, from));
    if (to) conditions.push(lte(auditLog.createdAt, to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(auditLog)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(auditLog.createdAt),
      this.db.select({ total: count() }).from(auditLog).where(where),
    ]);

    return auditLogsPaginatedResponseSchema.parse({
      items,
      total,
      page,
      limit,
    });
  }

  async create(data: CreateAuditLogInput): Promise<void> {
    await this.db.insert(auditLog).values({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ?? null,
      metadata: data.metadata ?? {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }
}
