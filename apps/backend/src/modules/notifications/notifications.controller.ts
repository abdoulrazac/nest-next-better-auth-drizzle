// apps/backend/src/modules/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '@/common/interceptors/audit-log.interceptor';
import {
  markAsReadSchema,
  type MarkAsReadInput,
} from '@repo/validators/notifications';

@ApiTags('notifications')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications' })
  @UserHasPermission({ permission: { notifications: ['read'] } })
  findAll(
    @CurrentUser() user: { id: string },
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationsService.findAll(
      user.id,
      Number(page),
      Number(limit),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Count unread notifications' })
  @UserHasPermission({ permission: { notifications: ['read'] } })
  countUnread(@CurrentUser() user: { id: string }) {
    return this.notificationsService.countUnread(user.id);
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark specific notifications as read' })
  @UserHasPermission({ permission: { notifications: ['read'] } })
  markAsRead(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(markAsReadSchema)) body: MarkAsReadInput,
  ) {
    return this.notificationsService.markAsRead(user.id, body);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @UserHasPermission({ permission: { notifications: ['read'] } })
  markAllAsRead(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @UserHasPermission({ permission: { notifications: ['manage'] } })
  remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.delete(user.id, id);
  }
}
