// apps/backend/src/modules/webhooks/webhooks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { WebhooksRepository } from './webhooks.repository';
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
} from '@repo/validators/webhooks';

@Injectable()
export class WebhooksService {
  constructor(private readonly webhooksRepository: WebhooksRepository) {}

  findAll(page: number, limit: number) {
    return this.webhooksRepository.findAll(page, limit);
  }

  async findById(id: string) {
    const found = await this.webhooksRepository.findById(id);
    if (!found) throw new NotFoundException(`Webhook ${id} not found`);
    return found;
  }

  create(data: CreateWebhookInput, userId?: string) {
    return this.webhooksRepository.create({ ...data, createdBy: userId });
  }

  async update(id: string, data: UpdateWebhookInput) {
    await this.findById(id);
    return this.webhooksRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.webhooksRepository.delete(id);
  }

  async getDeliveries(id: string, page: number, limit: number) {
    await this.findById(id);
    return this.webhooksRepository.findDeliveriesByWebhook(id, page, limit);
  }
}
