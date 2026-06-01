// apps/backend/src/modules/messaging/messages/messages.service.ts
import { DomainEvent, type MessageNewEvent } from '@/events/domain-events';
import { S3Service } from '@/modules/files/s3.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type {
  AttachmentPresignedUrlInput,
  AttachmentUrlResponse,
  EditMessageInput,
  ForwardMessageInput,
  MessageResponse,
  SendMessageInput,
} from '@repo/validators/messages';
import {
  attachmentUrlResponseSchema,
  messageResponseSchema,
} from '@repo/validators/messages';
import { randomUUID } from 'crypto';
import { ConversationsRepository } from '../conversations/conversations.repository';
import { MessagesRepository } from './messages.repository';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepo: MessagesRepository,
    private readonly conversationsRepo: ConversationsRepository,
    private readonly s3Service: S3Service,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    conversationId: string,
    userId: string,
    limit: number,
    before?: string,
    search?: string,
  ): Promise<MessageResponse[]> {
    const participant = await this.conversationsRepo.getParticipant(
      conversationId,
      userId,
    );
    if (!participant) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    const messages = await this.messagesRepo.findInConversation(
      conversationId,
      participant.joinedAt,
      limit,
      before,
      search,
    );

    return messageResponseSchema.array().parse(messages);
  }

  async send(
    conversationId: string,
    senderId: string,
    senderName: string,
    input: SendMessageInput,
  ): Promise<MessageResponse> {
    await this.assertParticipant(conversationId, senderId);

    // Verify every attachment was actually uploaded to S3
    for (const att of input.attachments) {
      const exists = await this.s3Service.objectExists(att.key);
      if (!exists) {
        throw new BadRequestException(
          `Attachment "${att.originalName}" not found in storage. Upload to the presigned URL first.`,
        );
      }
    }

    // Resolve public URLs for all attachments
    const attachments = input.attachments.map((att) => ({
      ...att,
      url: this.s3Service.getPublicUrl(att.key),
    }));

    // Resolve quote data when replying
    let quotedBody: string | undefined;
    let quotedSenderId: string | undefined;
    if (input.replyToId) {
      const original = await this.messagesRepo.findById(input.replyToId);
      if (original) {
        quotedBody = original.body;
        quotedSenderId = original.senderId ?? undefined;
      }
    }

    const created = await this.messagesRepo.create({
      conversationId,
      senderId,
      body: input.body,
      replyToId: input.replyToId,
      quotedBody,
      quotedSenderId,
      forwardedFromId: input.forwardedFromId,
      attachments,
    });

    await this.conversationsRepo.touchConversation(conversationId);

    // Build notification preview
    const firstAtt = created.attachments[0];
    const preview =
      firstAtt?.type === 'voice'
        ? 'a envoyé un message vocal'
        : created.attachments.length > 0
          ? 'a partagé un fichier'
          : created.body.slice(0, 100);

    // Fetch conversation metadata for the event
    const [conversation, participants] = await Promise.all([
      this.conversationsRepo.findById(conversationId),
      this.conversationsRepo.findParticipants(conversationId),
    ]);

    const recipientIds = participants
      .map((p) => p.userId)
      .filter((id) => id !== senderId);

    const event: MessageNewEvent = {
      messageId: created.id,
      conversationId,
      senderId,
      senderName,
      conversationType: (conversation?.type ?? 'direct') as 'direct' | 'group',
      conversationName: conversation?.name ?? null,
      recipientIds,
      preview,
    };

    this.eventEmitter.emit(DomainEvent.MESSAGE_NEW, event);

    return messageResponseSchema.parse(created);
  }

  async edit(
    conversationId: string,
    messageId: string,
    userId: string,
    input: EditMessageInput,
  ): Promise<MessageResponse> {
    await this.assertParticipant(conversationId, userId);

    const existing = await this.messagesRepo.findById(messageId);
    if (!existing) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    if (existing.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const ageMs = Date.now() - existing.createdAt.getTime();
    if (ageMs > 15 * 60 * 1000) {
      throw new BadRequestException(
        'Cannot edit a message older than 15 minutes',
      );
    }

    const updated = await this.messagesRepo.update(
      messageId,
      userId,
      input.body,
    );
    if (!updated) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    return messageResponseSchema.parse(updated);
  }

  async delete(
    conversationId: string,
    messageId: string,
    userId: string,
  ): Promise<MessageResponse> {
    await this.assertParticipant(conversationId, userId);

    const deleted = await this.messagesRepo.softDelete(messageId, userId);
    if (!deleted) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    return messageResponseSchema.parse(deleted);
  }

  async getAttachmentUrl(
    conversationId: string,
    userId: string,
    input: AttachmentPresignedUrlInput,
  ): Promise<AttachmentUrlResponse> {
    await this.assertParticipant(conversationId, userId);

    const ext = input.originalName.split('.').pop() ?? 'bin';
    const key = `chat/${conversationId}/${randomUUID()}.${ext}`;
    const uploadUrl = await this.s3Service.getPresignedUploadUrl(
      key,
      input.mimeType,
    );

    return attachmentUrlResponseSchema.parse({ uploadUrl, key });
  }

  async forward(
    conversationId: string,
    messageId: string,
    userId: string,
    senderName: string,
    input: ForwardMessageInput,
  ): Promise<MessageResponse> {
    await this.assertParticipant(conversationId, userId);
    await this.assertParticipant(input.targetConversationId, userId);

    const original = await this.messagesRepo.findById(messageId);
    if (!original) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    const forwarded = await this.messagesRepo.create({
      conversationId: input.targetConversationId,
      senderId: userId,
      body: input.body,
      forwardedFromId: messageId,
      // Re-use the same S3 objects — no duplication needed
      attachments: original.attachments.map((att) => ({
        key: att.key,
        url: att.url,
        originalName: att.originalName,
        mimeType: att.mimeType,
        size: att.size,
        type: att.type,
        duration: att.duration ?? undefined,
      })),
    });

    await this.conversationsRepo.touchConversation(input.targetConversationId);

    // Emit MESSAGE_NEW for the target conversation
    const [targetConversation, targetParticipants] = await Promise.all([
      this.conversationsRepo.findById(input.targetConversationId),
      this.conversationsRepo.findParticipants(input.targetConversationId),
    ]);

    const firstAtt = forwarded.attachments[0];
    const preview =
      firstAtt?.type === 'voice'
        ? 'a envoyé un message vocal'
        : forwarded.attachments.length > 0
          ? 'a partagé un fichier'
          : forwarded.body.slice(0, 100);

    const event: MessageNewEvent = {
      messageId: forwarded.id,
      conversationId: input.targetConversationId,
      senderId: userId,
      senderName,
      conversationType: (targetConversation?.type ?? 'direct') as
        | 'direct'
        | 'group',
      conversationName: targetConversation?.name ?? null,
      recipientIds: targetParticipants
        .map((p) => p.userId)
        .filter((id) => id !== userId),
      preview,
    };

    this.eventEmitter.emit(DomainEvent.MESSAGE_NEW, event);

    return messageResponseSchema.parse(forwarded);
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.assertParticipant(conversationId, userId);
    await this.conversationsRepo.updateLastRead(conversationId, userId);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async assertParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const participant = await this.conversationsRepo.getParticipant(
      conversationId,
      userId,
    );
    if (!participant) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }
  }
}
