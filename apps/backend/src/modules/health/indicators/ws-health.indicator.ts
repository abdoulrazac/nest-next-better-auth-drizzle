// apps/backend/src/modules/health/indicators/ws-health.indicator.ts
import { WebSocketService } from '@/websocket/websocket.service';
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class WsHealthIndicator {
  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    try {
      const status = this.webSocketService.getStatus();
      if (!status.up) {
        throw new Error('WebSocket server is not initialized');
      }
      return indicator.up({ clientsCount: status.clientsCount });
    } catch (err) {
      return indicator.down({ message: (err as Error).message });
    }
  }
}
