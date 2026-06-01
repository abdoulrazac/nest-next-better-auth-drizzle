// apps/backend/src/modules/messaging/messaging.module.ts
import { FilesModule } from '@/modules/files/files.module';
import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations/conversations.controller';
import { ConversationsRepository } from './conversations/conversations.repository';
import { ConversationsService } from './conversations/conversations.service';
import { MessagesController } from './messages/messages.controller';
import { MessagesRepository } from './messages/messages.repository';
import { MessagesService } from './messages/messages.service';
import { MessagingGateway } from './messaging.gateway';
import { PresenceService } from './presence/presence.service';
import { ReactionsController } from './reactions/reactions.controller';
import { ReactionsRepository } from './reactions/reactions.repository';
import { ReactionsService } from './reactions/reactions.service';

@Module({
  imports: [FilesModule],
  controllers: [
    ConversationsController,
    MessagesController,
    ReactionsController,
  ],
  providers: [
    ConversationsService,
    ConversationsRepository,
    MessagesService,
    MessagesRepository,
    ReactionsService,
    ReactionsRepository,
    PresenceService,
    MessagingGateway,
  ],
  exports: [ConversationsService, MessagesService],
})
export class MessagingModule {}
