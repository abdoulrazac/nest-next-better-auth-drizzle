// apps/backend/src/modules/notifications/notifications.controller.ts
import { Permissions } from '@/auth/permission';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import { ZodBody, ZodQuery } from '@/common/decorators/zod.decorators';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  markAsReadSchema,
  notificationQuerySchema,
  notificationResponseSchema,
  notificationsPaginatedResponseSchema,
  unreadCountResponseSchema,
  type MarkAsReadInput,
  type NotificationQuery,
  type NotificationResponse,
  type NotificationsPaginatedResponse,
  type NotificationUnreadCountResponse,
} from '@repo/validators/notifications';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications' })
  @ApiZodOkResponse(notificationsPaginatedResponseSchema)
  @UserHasPermission({ permission: Permissions.notifications.read })
  findAll(
    @CurrentUser() user: { id: string },
    @ZodQuery(notificationQuerySchema) query: NotificationQuery,
  ): Promise<NotificationsPaginatedResponse> {
    return this.notificationsService.findAll(user.id, query.page, query.limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Count unread notifications' })
  @ApiZodOkResponse(unreadCountResponseSchema)
  @UserHasPermission({ permission: Permissions.notifications.read })
  countUnread(
    @CurrentUser() user: { id: string },
  ): Promise<NotificationUnreadCountResponse> {
    return this.notificationsService.countUnread(user.id);
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark specific notifications as read' })
  @ApiZodOkResponse(notificationResponseSchema, { isArray: true })
  @UserHasPermission({ permission: Permissions.notifications.manage })
  markAsRead(
    @CurrentUser() user: { id: string },
    @ZodBody(markAsReadSchema) body: MarkAsReadInput,
  ): Promise<NotificationResponse[]> {
    return this.notificationsService.markAsRead(user.id, body);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiZodOkResponse(notificationResponseSchema, { isArray: true })
  @UserHasPermission({ permission: Permissions.notifications.manage })
  markAllAsRead(
    @CurrentUser() user: { id: string },
  ): Promise<NotificationResponse[]> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiZodOkResponse(notificationResponseSchema)
  @UserHasPermission({ permission: Permissions.notifications.manage })
  remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponse> {
    return this.notificationsService.delete(user.id, id);
  }
}
