// apps/backend/src/modules/settings/settings.repository.ts
import { Injectable } from '@nestjs/common';
import { db, appSetting, userPreference } from '@repo/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class SettingsRepository {
  async findAllAppSettings() {
    return db.select().from(appSetting).orderBy(appSetting.key);
  }

  async findAppSetting(key: string) {
    const [found] = await db
      .select()
      .from(appSetting)
      .where(eq(appSetting.key, key));
    return found ?? null;
  }

  async upsertAppSetting(key: string, value: string) {
    const [result] = await db
      .insert(appSetting)
      .values({ key, value })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async findUserPreference(userId: string) {
    const [found] = await db
      .select()
      .from(userPreference)
      .where(eq(userPreference.userId, userId));
    return found ?? null;
  }

  async upsertUserPreference(
    userId: string,
    data: { theme?: string; language?: string; timezone?: string },
  ) {
    const [result] = await db
      .insert(userPreference)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: userPreference.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
  }
}
