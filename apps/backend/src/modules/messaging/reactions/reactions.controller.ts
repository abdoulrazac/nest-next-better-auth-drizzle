// apps/backend/src/modules/messaging/reactions/reactions.controller.ts
import { Permissions } from '@/auth/permission';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import { Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  toggleReactionResponseSchema,
  type ToggleReactionResponse,
} from '@repo/validators/messages';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { MessagingGateway } from '../messaging.gateway';
import { ReactionsService } from './reactions.service';

@ApiTags('messaging')
@ApiBearerAuth()
@Controller({ path: 'messaging', version: '1' })
export class ReactionsController {
  constructor(
    private readonly reactionsService: ReactionsService,
    private readonly messagingGateway: MessagingGateway,
  ) {}

  @Post('conversations/:id/messages/:msgId/reactions/:emoji')
  @ApiOperation({ summary: 'Toggle a reaction on a message' })
  @ApiZodOkResponse(toggleReactionResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.write })
  async toggleReaction(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('msgId', ParseUUIDPipe) msgId: string,
    @Param('emoji') emoji: string,
  ): Promise<ToggleReactionResponse> {
    const result = await this.reactionsService.toggleReaction(
      id,
      msgId,
      user.id,
      emoji,
    );
    this.messagingGateway.emitToConversation(id, 'message:reaction', {
      messageId: msgId,
      emoji,
      added: result.added,
      reactions: result.reactions,
    });
    return result;
  }

  @Delete('conversations/:id/messages/:msgId/reactions/:emoji')
  @ApiOperation({ summary: 'Remove a reaction from a message' })
  @ApiZodOkResponse(toggleReactionResponseSchema)
  @UserHasPermission({ permission: Permissions.messages.write })
  async removeReaction(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('msgId', ParseUUIDPipe) msgId: string,
    @Param('emoji') emoji: string,
  ): Promise<ToggleReactionResponse> {
    const result = await this.reactionsService.toggleReaction(
      id,
      msgId,
      user.id,
      emoji,
    );
    this.messagingGateway.emitToConversation(id, 'message:reaction', {
      messageId: msgId,
      emoji,
      added: result.added,
      reactions: result.reactions,
    });
    return result;
  }
}
