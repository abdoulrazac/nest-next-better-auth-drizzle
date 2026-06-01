// apps/backend/src/modules/settings/settings.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/database/database.module';
import type { db as DbType } from '@repo/db';
import { appSetting, userPreference } from '@repo/db';
import { eq } from 'drizzle-orm';
import {
  userPreferencesResponseSchema,
  type UserPreferencesResponse,
} from '@repo/validators/settings';

type DB = typeof DbType;

@Injectable()
export class SettingsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  async findAllAppSettings() {
    return this.db.select().from(appSetting).orderBy(appSetting.key);
  }

  async findAppSetting(key: string) {
    const [found] = await this.db
      .select()
      .from(appSetting)
      .where(eq(appSetting.key, key));
    return found ?? null;
  }

  async upsertAppSetting(key: string, value: string) {
    const [result] = await this.db
      .insert(appSetting)
      .values({ key, value })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async findUserPreference(
    userId: string,
  ): Promise<UserPreferencesResponse | null> {
    const [found] = await this.db
      .select()
      .from(userPreference)
      .where(eq(userPreference.userId, userId));

    if (!found) return null;
    return userPreferencesResponseSchema.parse(found);
  }

  async upsertUserPreference(
    userId: string,
    data: { theme?: string; language?: string; timezone?: string },
  ): Promise<UserPreferencesResponse> {
    const [result] = await this.db
      .insert(userPreference)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: userPreference.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();

    return userPreferencesResponseSchema.parse(result);
  }
}
