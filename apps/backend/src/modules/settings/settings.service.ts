// apps/backend/src/modules/settings/settings.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import type {
  AppSettings,
  UpdateAppSettings,
  UserPreferences,
  UpdateUserPreferences,
} from '@repo/validators/settings';

const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: 'Enterprise App',
  supportEmail: 'support@example.com',
  maintenanceMode: false,
};

@Injectable()
export class SettingsService implements OnApplicationBootstrap {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async onApplicationBootstrap() {
    for (const [key, value] of Object.entries(DEFAULT_APP_SETTINGS)) {
      const existing = await this.settingsRepository.findAppSetting(key);
      if (!existing) {
        await this.settingsRepository.upsertAppSetting(
          key,
          JSON.stringify(value),
        );
      }
    }
  }

  async getAppSettings(): Promise<AppSettings> {
    const rows = await this.settingsRepository.findAllAppSettings();
    const raw = Object.fromEntries(
      rows.map((r) => {
        try {
          return [r.key, JSON.parse(r.value)];
        } catch {
          return [r.key, r.value];
        }
      }),
    );
    return raw as AppSettings;
  }

  async updateAppSettings(data: UpdateAppSettings) {
    for (const [key, value] of Object.entries(data)) {
      await this.settingsRepository.upsertAppSetting(
        key,
        JSON.stringify(value),
      );
    }
    return this.getAppSettings();
  }

  async getUserPreferences(userId: string) {
    return (
      (await this.settingsRepository.findUserPreference(userId)) ?? {
        userId,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
      }
    );
  }

  async updateUserPreferences(userId: string, data: UpdateUserPreferences) {
    return this.settingsRepository.upsertUserPreference(userId, data);
  }
}
