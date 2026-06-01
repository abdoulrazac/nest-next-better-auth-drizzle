// apps/backend/src/modules/settings/settings.controller.ts
import { Controller, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { Permissions } from '@/auth/permission';
import { ZodBody } from '@/common/decorators/zod.decorators';
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import { SettingsService } from './settings.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  appSettingsResponseSchema,
  updateAppSettingsSchema,
  updateUserPreferencesSchema,
  userPreferencesResponseSchema,
  type AppSettingsResponse,
  type UpdateAppSettings,
  type UserPreferencesResponse,
  type UpdateUserPreferences,
} from '@repo/validators/settings';

@ApiTags('settings')
@ApiBearerAuth()
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('app')
  @ApiOperation({ summary: 'Get app settings' })
  @ApiZodOkResponse(appSettingsResponseSchema)
  @UserHasPermission({ permission: Permissions.settings.read })
  getAppSettings(): Promise<AppSettingsResponse> {
    return this.settingsService.getAppSettings();
  }

  @Patch('app')
  @ApiOperation({ summary: 'Update app settings (admin only)' })
  @ApiZodOkResponse(appSettingsResponseSchema)
  @UserHasPermission({ permission: Permissions.settings.manage })
  updateAppSettings(
    @ZodBody(updateAppSettingsSchema) body: UpdateAppSettings,
  ): Promise<AppSettingsResponse> {
    return this.settingsService.updateAppSettings(body);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get my preferences' })
  @ApiZodOkResponse(userPreferencesResponseSchema)
  @UserHasPermission({ permission: Permissions.settings.read })
  getPreferences(
    @CurrentUser() user: { id: string },
  ): Promise<UserPreferencesResponse> {
    return this.settingsService.getUserPreferences(user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update my preferences' })
  @ApiZodOkResponse(userPreferencesResponseSchema)
  @UserHasPermission({ permission: Permissions.settings.manage })
  updatePreferences(
    @CurrentUser() user: { id: string },
    @ZodBody(updateUserPreferencesSchema) body: UpdateUserPreferences,
  ): Promise<UserPreferencesResponse> {
    return this.settingsService.updateUserPreferences(user.id, body);
  }
}
