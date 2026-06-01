// apps/backend/src/modules/accounts/roles/roles.repository.ts
import { DATABASE_TOKEN } from '@/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import type { db as DbType } from '@repo/db';
import { role, userRole } from '@repo/db';
import type {
  CreateRoleInput,
  RoleResponse,
  UpdateRoleInput,
  UserRoleResponse,
} from '@repo/validators/accounts';
import {
  roleResponseSchema,
  userRoleResponseSchema,
} from '@repo/validators/accounts';
import { and, eq } from 'drizzle-orm';

type DB = typeof DbType;

@Injectable()
export class RolesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  private readonly roleArraySchema = roleResponseSchema.array();

  async findAll(): Promise<RoleResponse[]> {
    const rows = await this.db.select().from(role).orderBy(role.name);
    return this.roleArraySchema.parse(rows);
  }

  async findById(id: string): Promise<RoleResponse | null> {
    const [found] = await this.db.select().from(role).where(eq(role.id, id));
    if (!found) return null;
    return roleResponseSchema.parse(found);
  }

  async create(data: CreateRoleInput): Promise<RoleResponse> {
    const [created] = await this.db
      .insert(role)
      .values({
        name: data.name,
        permissions: data.permissions,
      })
      .returning();
    return roleResponseSchema.parse(created);
  }

  async update(
    id: string,
    data: UpdateRoleInput,
  ): Promise<RoleResponse | null> {
    const [updated] = await this.db
      .update(role)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(role.id, id))
      .returning();
    if (!updated) return null;
    return roleResponseSchema.parse(updated);
  }

  async delete(id: string): Promise<RoleResponse | null> {
    const [deleted] = await this.db
      .delete(role)
      .where(eq(role.id, id))
      .returning();
    if (!deleted) return null;
    return roleResponseSchema.parse(deleted);
  }

  async assignToUser(
    userId: string,
    roleId: string,
  ): Promise<UserRoleResponse> {
    const [created] = await this.db
      .insert(userRole)
      .values({ userId, roleId })
      .onConflictDoNothing()
      .returning();

    if (created) {
      return userRoleResponseSchema.parse(created);
    }

    const [existing] = await this.db
      .select()
      .from(userRole)
      .where(and(eq(userRole.userId, userId), eq(userRole.roleId, roleId)))
      .limit(1);

    return userRoleResponseSchema.parse(existing);
  }

  async removeFromUser(
    userId: string,
    roleId: string,
  ): Promise<UserRoleResponse | null> {
    const [deleted] = await this.db
      .delete(userRole)
      .where(and(eq(userRole.userId, userId), eq(userRole.roleId, roleId)))
      .returning();
    if (!deleted) return null;
    return userRoleResponseSchema.parse(deleted);
  }
}
