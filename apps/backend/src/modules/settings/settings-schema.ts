// apps/backend/src/modules/settings/settings-schema.ts
/**
 * Single source of truth for all app settings keys, their Zod schemas,
 * and their default values.
 *
 * Adding a new setting means editing this file only — the seed logic and
 * the typed read both derive from this map automatically.
 */
import { z } from 'zod';

export interface SettingEntry<T> {
  schema: z.ZodType<T>;
  defaultValue: T;
}

export const SETTINGS_SCHEMA: Record<string, SettingEntry<any>> = {
  appName: {
    schema: z.string().min(1).max(100),
    defaultValue: 'Enterprise App',
  },
  supportEmail: {
    schema: z.string().email(),
    defaultValue: 'support@example.com',
  },
  maintenanceMode: {
    schema: z.boolean(),
    defaultValue: false,
  },
};

export const SETTING_KEYS = Object.keys(SETTINGS_SCHEMA);
