// apps/backend/src/modules/webhooks/webhooks.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhooksController } from './webhooks.controller';
import { WebhooksRepository } from './webhooks.repository';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [HttpModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksRepository, WebhookDeliveryService],
})
export class WebhooksModule {}
