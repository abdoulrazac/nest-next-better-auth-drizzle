// apps/backend/src/modules/webhooks/webhooks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookDeliveriesPaginatedResponse,
  WebhookResponse,
  WebhooksPaginatedResponse,
} from '@repo/validators/webhooks';
import {
  webhookDeliveriesPaginatedResponseSchema,
  webhookResponseSchema,
  webhooksPaginatedResponseSchema,
} from '@repo/validators/webhooks';
import { WebhooksRepository } from './webhooks.repository';

@Injectable()
export class WebhooksService {
  constructor(private readonly webhooksRepository: WebhooksRepository) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<WebhooksPaginatedResponse> {
    const webhooks = await this.webhooksRepository.findAll(page, limit);
    return webhooksPaginatedResponseSchema.parse(webhooks);
  }

  async findById(id: string): Promise<WebhookResponse> {
    const found = await this.webhooksRepository.findById(id);
    if (!found) throw new NotFoundException(`Webhook ${id} not found`);
    return webhookResponseSchema.parse(found);
  }

  async create(
    data: CreateWebhookInput,
    userId?: string,
  ): Promise<WebhookResponse> {
    const created = await this.webhooksRepository.create({
      ...data,
      createdBy: userId,
    });
    return webhookResponseSchema.parse(created);
  }

  async update(
    id: string,
    data: UpdateWebhookInput,
  ): Promise<WebhookResponse | null> {
    await this.findById(id);
    const updated = await this.webhooksRepository.update(id, data);
    if (!updated) return null;
    return webhookResponseSchema.parse(updated);
  }

  async delete(id: string): Promise<WebhookResponse | null> {
    await this.findById(id);
    const deleted = await this.webhooksRepository.delete(id);
    if (!deleted) return null;
    return webhookResponseSchema.parse(deleted);
  }

  async getDeliveries(
    id: string,
    page: number,
    limit: number,
  ): Promise<WebhookDeliveriesPaginatedResponse> {
    await this.findById(id);
    const deliveries = await this.webhooksRepository.findDeliveriesByWebhook(
      id,
      page,
      limit,
    );
    return webhookDeliveriesPaginatedResponseSchema.parse(deliveries);
  }
}
