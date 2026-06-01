// apps/backend/src/modules/files/files.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/database/database.module';
import type { db as DbType } from '@repo/db';
import { file } from '@repo/db';
import { eq, ilike, count, and, type SQL } from 'drizzle-orm';
import {
  fileResponseSchema,
  filesPaginatedResponseSchema,
  type FileQuery,
  type FileResponse,
  type FilesPaginatedResponse,
} from '@repo/validators/files';

type DB = typeof DbType;

@Injectable()
export class FilesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  async findAll(query: FileQuery): Promise<FilesPaginatedResponse> {
    const { page, limit, mimeType } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (mimeType) conditions.push(ilike(file.mimeType, `${mimeType}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(file)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(file.createdAt),
      this.db.select({ total: count() }).from(file).where(where),
    ]);

    return filesPaginatedResponseSchema.parse({ items, total, page, limit });
  }

  async findById(id: string): Promise<FileResponse | null> {
    const [found] = await this.db.select().from(file).where(eq(file.id, id));
    if (!found) return null;
    return fileResponseSchema.parse(found);
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
  }): Promise<FileResponse> {
    const [created] = await this.db.insert(file).values(data).returning();
    return fileResponseSchema.parse(created);
  }

  async delete(id: string): Promise<FileResponse | null> {
    const [deleted] = await this.db
      .delete(file)
      .where(eq(file.id, id))
      .returning();
    if (!deleted) return null;
    return fileResponseSchema.parse(deleted);
  }
}
