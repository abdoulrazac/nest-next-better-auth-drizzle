// apps/backend/src/modules/messaging/reactions/reactions.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  toggleReactionResponseSchema,
  type ToggleReactionResponse,
} from '@repo/validators/messages';
import { ConversationsRepository } from '../conversations/conversations.repository';
import { ReactionsRepository } from './reactions.repository';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly reactionsRepository: ReactionsRepository,
    private readonly conversationsRepository: ConversationsRepository,
  ) {}

  async toggleReaction(
    conversationId: string,
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<ToggleReactionResponse> {
    const isMember = await this.conversationsRepository.isParticipant(
      conversationId,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    const existing = await this.reactionsRepository.findOne(
      messageId,
      userId,
      emoji,
    );

    let added: boolean;
    if (existing) {
      await this.reactionsRepository.delete(messageId, userId, emoji);
      added = false;
    } else {
      await this.reactionsRepository.create(messageId, userId, emoji);
      added = true;
    }

    const reactions = await this.reactionsRepository.findByMessage(messageId);
    return toggleReactionResponseSchema.parse({ added, reactions });
  }
}
