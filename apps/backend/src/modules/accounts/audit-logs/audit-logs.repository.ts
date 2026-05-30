// apps/backend/src/modules/accounts/audit-logs/audit-logs.repository.ts
import { Injectable } from '@nestjs/common';
import { db, auditLog } from '@repo/db';
import { eq, and, gte, lte, count, type SQL } from 'drizzle-orm';
import type { AuditLogQuery } from '@repo/validators/accounts';

@Injectable()
export class AuditLogsRepository {
  async findAll(query: AuditLogQuery) {
    const { page, limit, userId, action, from, to } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (userId) conditions.push(eq(auditLog.userId, userId));
    if (action) conditions.push(eq(auditLog.action, action));
    if (from) conditions.push(gte(auditLog.createdAt, from));
    if (to) conditions.push(lte(auditLog.createdAt, to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(auditLog)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(auditLog.createdAt),
      db.select({ total: count() }).from(auditLog).where(where),
    ]);

    return { items, total, page, limit };
  }
}
