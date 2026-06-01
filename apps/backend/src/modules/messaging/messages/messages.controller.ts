// apps/backend/src/modules/messaging/messages/messages.controller.ts
import { Permissions } from '@/auth/permission';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ZodBody } from '@/common/decorators/zod.decorators';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  attachmentPresignedUrlSchema,
  editMessageSchema,
  forwardMessageSchema,
  sendMessageSchema,
  type AttachmentPresignedUrlInput,
  type AttachmentUrlResponse,
  type EditMessageInput,
  type ForwardMessageInput,
  type MessageResponse,
  type SendMessageInput,
} from '@repo/validators/messages';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { MessagingGateway } from '../messaging.gateway';
import { MessagesService } from './messages.service';

@ApiTags('messaging')
@ApiBearerAuth()
@Controller({ version: '1' })
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly gateway: MessagingGateway,
  ) {}

  // ─── List & search ──────────────────────────────────────────────────────────

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'List messages in a conversation' })
  @UserHasPermission({ permission: Permissions.messages.read })
  findAll(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit = 50,
    @Query('before') before?: string,
  ): Promise<MessageResponse[]> {
    return this.messagesService.findAll(id, user.id, Number(limit), before);
  }

  @Get('conversations/:id/messages/search')
  @ApiOperation({ summary: 'Full-text search messages in a conversation' })
  @UserHasPermission({ permission: Permissions.messages.read })
  search(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('q') q: string,
    @Query('limit') limit = 50,
    @Query('before') before?: string,
  ): Promise<MessageResponse[]> {
    return this.messagesService.findAll(id, user.id, Number(limit), before, q);
  }

  // ─── Send ───────────────────────────────────────────────────────────────────

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message' })
  @UserHasPermission({ permission: Permissions.messages.write })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async send(
    @CurrentUser() user: { id: string; name: string },
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(sendMessageSchema) body: SendMessageInput,
  ): Promise<MessageResponse> {
    const message = await this.messagesService.send(
      id,
      user.id,
      user.name,
      body,
    );
    this.gateway.emitToConversation(id, 'message:new', message);
    return message;
  }

  // ─── Edit ───────────────────────────────────────────────────────────────────

  @Patch('conversations/:id/messages/:msgId')
  @ApiOperation({ summary: 'Edit a message' })
  @UserHasPermission({ permission: Permissions.messages.write })
  async edit(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('msgId', ParseUUIDPipe) msgId: string,
    @ZodBody(editMessageSchema) body: EditMessageInput,
  ): Promise<MessageResponse> {
    const message = await this.messagesService.edit(id, msgId, user.id, body);
    this.gateway.emitToConversation(id, 'message:updated', message);
    return message;
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────

  @Delete('conversations/:id/messages/:msgId')
  @ApiOperation({ summary: 'Delete a message' })
  @UserHasPermission({ permission: Permissions.messages.delete })
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('msgId', ParseUUIDPipe) msgId: string,
  ) {
    await this.messagesService.delete(id, msgId, user.id);
    this.gateway.emitToConversation(id, 'message:deleted', {
      messageId: msgId,
    });
    return { success: true };
  }

  // ─── Attachment presigned URL ────────────────────────────────────────────────

  @Post('conversations/:id/messages/attachment-url')
  @ApiOperation({ summary: 'Get a presigned URL for a message attachment' })
  @UserHasPermission({ permission: Permissions.messages.write })
  getAttachmentUrl(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(attachmentPresignedUrlSchema) body: AttachmentPresignedUrlInput,
  ): Promise<AttachmentUrlResponse> {
    return this.messagesService.getAttachmentUrl(id, user.id, body);
  }

  // ─── Forward ────────────────────────────────────────────────────────────────

  @Post('conversations/:id/messages/:msgId/forward')
  @ApiOperation({ summary: 'Forward a message to another conversation' })
  @UserHasPermission({ permission: Permissions.messages.write })
  async forward(
    @CurrentUser() user: { id: string; name: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('msgId', ParseUUIDPipe) msgId: string,
    @ZodBody(forwardMessageSchema) body: ForwardMessageInput,
  ): Promise<MessageResponse> {
    const forwardedMsg = await this.messagesService.forward(
      id,
      msgId,
      user.id,
      user.name,
      body,
    );
    this.gateway.emitToConversation(
      body.targetConversationId,
      'message:new',
      forwardedMsg,
    );
    return forwardedMsg;
  }

  // ─── Mark as read ────────────────────────────────────────────────────────────

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @UserHasPermission({ permission: Permissions.messages.write })
  markAsRead(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.markAsRead(id, user.id);
  }
}
