// apps/backend/src/modules/settings/settings.controller.ts
import { Controller, Get, Patch, Body, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { SettingsService } from './settings.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '@/common/interceptors/audit-log.interceptor';
import {
  updateAppSettingsSchema,
  updateUserPreferencesSchema,
  type UpdateAppSettings,
  type UpdateUserPreferences,
} from '@repo/validators/settings';

@ApiTags('settings')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('app')
  @ApiOperation({ summary: 'Get app settings' })
  @UserHasPermission({ permission: { settings: ['read'] } })
  getAppSettings() {
    return this.settingsService.getAppSettings();
  }

  @Patch('app')
  @ApiOperation({ summary: 'Update app settings (admin only)' })
  @UserHasPermission({ permission: { settings: ['manage'] } })
  updateAppSettings(
    @Body(new ZodValidationPipe(updateAppSettingsSchema))
    body: UpdateAppSettings,
  ) {
    return this.settingsService.updateAppSettings(body);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get my preferences' })
  @UserHasPermission({ permission: { settings: ['read'] } })
  getPreferences(@CurrentUser() user: { id: string }) {
    return this.settingsService.getUserPreferences(user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update my preferences' })
  @UserHasPermission({ permission: { settings: ['write'] } })
  updatePreferences(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(updateUserPreferencesSchema))
    body: UpdateUserPreferences,
  ) {
    return this.settingsService.updateUserPreferences(user.id, body);
  }
}
