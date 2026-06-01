// apps/backend/src/modules/settings/settings.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { SETTINGS_SCHEMA, SETTING_KEYS } from './settings-schema';
import {
  appSettingsResponseSchema,
  userPreferencesResponseSchema,
  type AppSettingsResponse,
  type UpdateAppSettings,
  type UpdateUserPreferences,
  type UserPreferencesResponse,
} from '@repo/validators/settings';
@Injectable()
export class SettingsService implements OnApplicationBootstrap {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async onApplicationBootstrap() {
    for (const key of SETTING_KEYS) {
      const existing = await this.settingsRepository.findAppSetting(key);
      if (!existing) {
        const defaultValue = SETTINGS_SCHEMA[key].defaultValue;
        await this.settingsRepository.upsertAppSetting(
          key,
          JSON.stringify(defaultValue),
        );
      }
    }
  }

  async getAppSettings(): Promise<AppSettingsResponse> {
    const rows = await this.settingsRepository.findAllAppSettings();
    const result = {} as Record<string, unknown>;

    for (const row of rows) {
      const entry = SETTINGS_SCHEMA[row.key];
      if (!entry) continue;

      try {
        const raw = JSON.parse(row.value);
        const parsed = entry.schema.safeParse(raw);
        result[row.key] = parsed.success ? parsed.data : entry.defaultValue;
      } catch {
        result[row.key] = entry.defaultValue;
      }
    }

    // Fill any missing keys with defaults
    for (const key of SETTING_KEYS) {
      if (!(key in result)) {
        result[key] = SETTINGS_SCHEMA[key].defaultValue;
      }
    }

    return appSettingsResponseSchema.parse(result);
  }

  async updateAppSettings(
    data: UpdateAppSettings,
  ): Promise<AppSettingsResponse> {
    for (const [key, value] of Object.entries(data)) {
      const entry = SETTINGS_SCHEMA[key];
      if (!entry) continue;

      const parsed = entry.schema.safeParse(value);
      if (!parsed.success) continue;

      await this.settingsRepository.upsertAppSetting(
        key,
        JSON.stringify(parsed.data),
      );
    }
    return this.getAppSettings();
  }

  async getUserPreferences(userId: string): Promise<UserPreferencesResponse> {
    const existing = await this.settingsRepository.findUserPreference(userId);

    if (existing) {
      return userPreferencesResponseSchema.parse(existing);
    }

    return userPreferencesResponseSchema.parse({
      userId,
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
    });
  }

  async updateUserPreferences(
    userId: string,
    data: UpdateUserPreferences,
  ): Promise<UserPreferencesResponse> {
    const updated = await this.settingsRepository.upsertUserPreference(
      userId,
      data,
    );
    return userPreferencesResponseSchema.parse(updated);
  }
}
