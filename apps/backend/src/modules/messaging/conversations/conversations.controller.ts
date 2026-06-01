// apps/backend/src/modules/messaging/conversations/conversations.controller.ts
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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  addParticipantSchema,
  conversationResponseSchema,
  createConversationSchema,
  paginatedResponseSchema,
  renameConversationSchema,
  type AddParticipantInput,
  type ConversationResponse,
  type ConversationWithParticipants,
  type CreateConversationInput,
  type PaginatedResponse,
  type RenameConversationInput,
} from '@repo/validators/messages';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { ConversationsService } from './conversations.service';

@ApiTags('messaging')
@ApiBearerAuth()
@Controller({ path: 'messaging', version: '1' })
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  private readonly paginatedConversationSchema = paginatedResponseSchema(
    conversationResponseSchema,
  );

  @Get('conversations')
  @ApiOperation({ summary: 'List conversations for current user' })
  @UserHasPermission({ permission: Permissions.messages.read })
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginatedResponse<ConversationResponse>> {
    return this.conversationsService.findAll(
      user.id,
      Number(page),
      Number(limit),
    );
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a conversation' })
  @UserHasPermission({ permission: Permissions.messages.write })
  create(
    @CurrentUser() user: { id: string },
    @ZodBody(createConversationSchema) body: CreateConversationInput,
  ): Promise<ConversationResponse | null> {
    return this.conversationsService.create(user.id, body);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a conversation by id' })
  @UserHasPermission({ permission: Permissions.messages.read })
  findOne(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConversationWithParticipants> {
    return this.conversationsService.findOne(id, user.id);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Rename a conversation (admin only)' })
  @UserHasPermission({ permission: Permissions.messages.write })
  rename(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(renameConversationSchema) body: RenameConversationInput,
  ): Promise<void> {
    return this.conversationsService.rename(id, user.id, body);
  }

  @Post('conversations/:id/participants')
  @ApiOperation({ summary: 'Add a participant to a conversation (admin only)' })
  @UserHasPermission({ permission: Permissions.messages.write })
  addParticipant(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(addParticipantSchema) body: AddParticipantInput,
  ): Promise<void> {
    return this.conversationsService.addParticipant(id, user.id, body.userId);
  }

  @Delete('conversations/:id/participants/:userId')
  @ApiOperation({
    summary: 'Remove a participant from a conversation (admin only)',
  })
  @UserHasPermission({ permission: Permissions.messages.delete })
  removeParticipant(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.conversationsService.removeParticipant(id, user.id, userId);
  }

  @Post('conversations/:id/leave')
  @ApiOperation({ summary: 'Leave a conversation' })
  @UserHasPermission({ permission: Permissions.messages.write })
  leave(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.conversationsService.leave(id, user.id);
  }

  @Post('conversations/:id/archive')
  @ApiOperation({ summary: 'Archive a conversation' })
  @UserHasPermission({ permission: Permissions.messages.write })
  archive(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.conversationsService.archive(id, user.id);
  }
}
