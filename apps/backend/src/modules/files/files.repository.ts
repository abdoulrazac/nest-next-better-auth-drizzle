// apps/backend/src/modules/files/files.repository.ts
import { Injectable } from '@nestjs/common';
import { db, file } from '@repo/db';
import { eq, ilike, count, and, type SQL } from 'drizzle-orm';
import type { FileQuery } from '@repo/validators/files';

@Injectable()
export class FilesRepository {
  async findAll(query: FileQuery) {
    const { page, limit, mimeType } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (mimeType) conditions.push(ilike(file.mimeType, `${mimeType}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(file)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(file.createdAt),
      db.select({ total: count() }).from(file).where(where),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const [found] = await db.select().from(file).where(eq(file.id, id));
    return found ?? null;
  }

  async create(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    key: string;
    url: string;
    uploadedBy?: string | null;
  }) {
    const [created] = await db.insert(file).values(data).returning();
    return created;
  }

  async delete(id: string) {
    const [deleted] = await db.delete(file).where(eq(file.id, id)).returning();
    return deleted ?? null;
  }
}
