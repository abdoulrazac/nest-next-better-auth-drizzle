// apps/backend/src/modules/notifications/notifications.module.ts
import { WebSocketModule } from '@/websocket/websocket.module';
import { Module } from '@nestjs/common';
import { NotificationsHandlers } from './notifications.handlers';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [WebSocketModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsHandlers,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
