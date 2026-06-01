// apps/backend/src/modules/messaging/conversations/conversations.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ConversationResponse,
  ConversationWithParticipants,
  CreateConversationInput,
  PaginatedResponse,
  ParticipantResponse,
  RenameConversationInput,
} from '@repo/validators/messages';
import {
  conversationResponseSchema,
  conversationWithParticipantsSchema,
  paginatedResponseSchema,
  participantResponseSchema,
} from '@repo/validators/messages';
import { ConversationsRepository } from './conversations.repository';

@Injectable()
export class ConversationsService {
  constructor(private readonly repo: ConversationsRepository) {}

  private readonly paginatedConversationSchema = paginatedResponseSchema(
    conversationResponseSchema,
  );

  async create(
    currentUserId: string,
    input: CreateConversationInput,
  ): Promise<ConversationResponse | null> {
    if (input.type === 'direct') {
      if (input.participantIds.length !== 1) {
        throw new BadRequestException(
          'Direct conversations must have exactly one other participant',
        );
      }

      const existing = await this.repo.findDirectConversation(
        currentUserId,
        input.participantIds[0],
      );

      if (existing) {
        const found = await this.repo.findById(existing.id);
        return found ? conversationResponseSchema.parse(found) : null;
      }
    }

    const allParticipants = [
      currentUserId,
      ...input.participantIds.filter((id) => id !== currentUserId),
    ];

    const created = await this.repo.create(
      input.type,
      input.name,
      currentUserId,
      allParticipants,
      undefined,
    );

    return conversationResponseSchema.parse(created);
  }

  async findAll(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<ConversationResponse>> {
    const result = await this.repo.findForUser(userId, page, limit);
    return this.paginatedConversationSchema.parse(result);
  }

  async findOne(
    conversationId: string,
    userId: string,
  ): Promise<ConversationWithParticipants> {
    await this.assertParticipant(conversationId, userId);

    const [conv, participants] = await Promise.all([
      this.repo.findById(conversationId),
      this.repo.findParticipants(conversationId),
    ]);

    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    return conversationWithParticipantsSchema.parse({
      ...conv,
      participants,
    });
  }

  async addParticipant(
    conversationId: string,
    adminId: string,
    userId: string,
  ): Promise<void> {
    await this.assertAdmin(conversationId, adminId);
    await this.repo.addParticipant(conversationId, userId);
  }

  async removeParticipant(
    conversationId: string,
    adminId: string,
    targetUserId: string,
  ): Promise<void> {
    await this.assertAdmin(conversationId, adminId);

    const conv = await this.repo.findById(conversationId);
    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    if (conv.createdBy === targetUserId) {
      throw new ForbiddenException('Cannot remove the conversation creator');
    }

    await this.repo.removeParticipant(conversationId, targetUserId);
  }

  async leave(conversationId: string, userId: string): Promise<void> {
    await this.assertParticipant(conversationId, userId);
    await this.repo.removeParticipant(conversationId, userId);
  }

  async archive(conversationId: string, userId: string): Promise<void> {
    const conv = await this.repo.findById(conversationId);
    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    if (conv.type === 'group') {
      await this.assertAdmin(conversationId, userId);
    } else {
      await this.assertParticipant(conversationId, userId);
    }

    await this.repo.archive(conversationId);
  }

  async rename(
    conversationId: string,
    userId: string,
    input: RenameConversationInput,
  ): Promise<void> {
    await this.assertAdmin(conversationId, userId);
    await this.repo.rename(conversationId, input.name);
  }

  async assertParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const participant = await this.repo.getParticipant(conversationId, userId);
    if (!participant) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }
  }

  async getParticipantInfo(
    conversationId: string,
    userId: string,
  ): Promise<ParticipantResponse | null> {
    const participant = await this.repo.getParticipant(conversationId, userId);
    return participant ? participantResponseSchema.parse(participant) : null;
  }

  async getParticipantIds(conversationId: string): Promise<string[]> {
    const participants = await this.repo.findParticipants(conversationId);
    return participants.map((p) => p.userId);
  }

  private async assertAdmin(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const participant = await this.repo.getParticipant(conversationId, userId);
    if (!participant || participant.role !== 'admin') {
      throw new ForbiddenException(
        'You must be an admin of this conversation to perform this action',
      );
    }
  }
}
