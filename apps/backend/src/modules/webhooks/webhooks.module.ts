// apps/backend/src/modules/webhooks/webhooks.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhooksRepository } from './webhooks.repository';
import { WebhookDeliveryService } from './webhook-delivery.service';

@Module({
  imports: [HttpModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksRepository, WebhookDeliveryService],
  exports: [WebhookDeliveryService],
})
export class WebhooksModule {}
