// apps/backend/src/modules/accounts/roles/roles.repository.ts
import { Injectable } from '@nestjs/common';
import { db, role, userRole } from '@repo/db';
import { eq } from 'drizzle-orm';
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from '@repo/validators/accounts';

@Injectable()
export class RolesRepository {
  async findAll() {
    return db.select().from(role).orderBy(role.name);
  }

  async findById(id: string) {
    const [found] = await db.select().from(role).where(eq(role.id, id));
    return found ?? null;
  }

  async create(data: CreateRoleInput) {
    const [created] = await db
      .insert(role)
      .values({
        name: data.name,
        permissions: data.permissions,
      })
      .returning();
    return created;
  }

  async update(id: string, data: UpdateRoleInput) {
    const [updated] = await db
      .update(role)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(role.id, id))
      .returning();
    return updated ?? null;
  }

  async delete(id: string) {
    const [deleted] = await db.delete(role).where(eq(role.id, id)).returning();
    return deleted ?? null;
  }

  async assignToUser(userId: string, roleId: string) {
    const [created] = await db
      .insert(userRole)
      .values({ userId, roleId })
      .onConflictDoNothing()
      .returning();
    return created;
  }

  async removeFromUser(userId: string, roleId: string) {
    const [deleted] = await db
      .delete(userRole)
      .where(eq(userRole.userId, userId))
      .returning();
    return deleted ?? null;
  }
}
