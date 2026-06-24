// apps/backend/src/websocket/websocket.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { PresenceService } from './presence.service';
import { WebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WsHandlerRegistry } from './ws-handler.registry';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    WebSocketGateway,
    WebSocketService,
    WsHandlerRegistry,
    PresenceService,
  ],
  exports: [WebSocketService, WsHandlerRegistry, PresenceService],
})
export class WebSocketModule {}
