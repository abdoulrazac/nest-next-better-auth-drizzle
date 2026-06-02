// apps/backend/src/modules/messaging/conversations/conversations.controller.ts
import { Permissions } from '@/auth/permission';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  ApiZodCreatedResponse,
  ApiZodOkResponse,
} from '@/common/decorators/zod-response.decorators';
import { ZodBody, ZodQuery } from '@/common/decorators/zod.decorators';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  addParticipantSchema,
  conversationQuerySchema,
  conversationResponseSchema,
  conversationWithParticipantsSchema,
  conversationsPaginatedResponseSchema,
  createConversationSchema,
  renameConversationSchema,
  type AddParticipantInput,
  type ConversationQuery,
  type ConversationResponse,
  type ConversationWithParticipants,
  type ConversationsPaginatedResponse,
  type CreateConversationInput,
  type RenameConversationInput,
} from '@repo/validators/messages';
import {
  successResponseSchema,
  type SuccessResponse,
} from '@repo/validators/shared';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { ConversationsService } from './conversations.service';

@ApiTags('messaging')
@ApiBearerAuth()
@Controller({ path: 'messaging', version: '1' })
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List conversations for current user' })
  @ApiZodOkResponse(conversationsPaginatedResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.read })
  findAll(
    @CurrentUser() user: { id: string },
    @ZodQuery(conversationQuerySchema) query: ConversationQuery,
  ): Promise<ConversationsPaginatedResponse> {
    return this.conversationsService.findAll(user.id, query.page, query.limit);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a conversation' })
  @ApiZodCreatedResponse(conversationResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.write })
  create(
    @CurrentUser() user: { id: string },
    @ZodBody(createConversationSchema) body: CreateConversationInput,
  ): Promise<ConversationResponse | null> {
    return this.conversationsService.create(user.id, body);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a conversation by id' })
  @ApiZodOkResponse(conversationWithParticipantsSchema)
  @UserHasPermission({ permission: Permissions.messages.read })
  findOne(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConversationWithParticipants> {
    return this.conversationsService.findOne(id, user.id);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Rename a conversation (admin only)' })
  @ApiZodOkResponse(successResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.write })
  async rename(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(renameConversationSchema) body: RenameConversationInput,
  ): Promise<SuccessResponse> {
    await this.conversationsService.rename(id, user.id, body);
    return { success: true };
  }

  @Post('conversations/:id/participants')
  @ApiOperation({ summary: 'Add a participant to a conversation (admin only)' })
  @ApiZodOkResponse(successResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.write })
  async addParticipant(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(addParticipantSchema) body: AddParticipantInput,
  ): Promise<SuccessResponse> {
    await this.conversationsService.addParticipant(id, user.id, body.userId);
    return { success: true };
  }

  @Delete('conversations/:id/participants/:userId')
  @ApiOperation({
    summary: 'Remove a participant from a conversation (admin only)',
  })
  @ApiZodOkResponse(successResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.delete })
  async removeParticipant(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId') userId: string,
  ): Promise<SuccessResponse> {
    await this.conversationsService.removeParticipant(id, user.id, userId);
    return { success: true };
  }

  @Post('conversations/:id/leave')
  @ApiOperation({ summary: 'Leave a conversation' })
  @ApiZodOkResponse(successResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.write })
  async leave(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessResponse> {
    await this.conversationsService.leave(id, user.id);
    return { success: true };
  }

  @Post('conversations/:id/archive')
  @ApiOperation({ summary: 'Archive a conversation' })
  @ApiZodOkResponse(successResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.write })
  async archive(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessResponse> {
    await this.conversationsService.archive(id, user.id);
    return { success: true };
  }
}
