// apps/backend/src/modules/webhooks/webhooks.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '@/database/database.module';
import type { db as DbType } from '@repo/db';
import { webhook, webhookDelivery } from '@repo/db';
import { eq, count, sql } from 'drizzle-orm';
import {
  webhookDeliveriesPaginatedResponseSchema,
  webhookDeliveryResponseSchema,
  webhookResponseSchema,
  webhooksPaginatedResponseSchema,
} from '@repo/validators/webhooks';
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookDeliveriesPaginatedResponse,
  WebhookDeliveryResponse,
  WebhookResponse,
  WebhooksPaginatedResponse,
} from '@repo/validators/webhooks';

type DB = typeof DbType;

@Injectable()
export class WebhooksRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DB) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<WebhooksPaginatedResponse> {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(webhook)
        .limit(limit)
        .offset(offset)
        .orderBy(webhook.createdAt),
      this.db.select({ total: count() }).from(webhook),
    ]);
    return webhooksPaginatedResponseSchema.parse({ items, total, page, limit });
  }

  async findById(id: string): Promise<WebhookResponse | null> {
    const [found] = await this.db
      .select()
      .from(webhook)
      .where(eq(webhook.id, id));
    if (!found) return null;
    return webhookResponseSchema.parse(found);
  }

  async findActiveByEvent(event: string): Promise<WebhookResponse[]> {
    const rows = await this.db
      .select()
      .from(webhook)
      .where(
        sql`${webhook.active} = true AND ${webhook.events} @> ARRAY[${event}]::text[]`,
      );

    return webhookResponseSchema.array().parse(rows);
  }

  async create(
    data: CreateWebhookInput & { createdBy?: string },
  ): Promise<WebhookResponse> {
    const [created] = await this.db
      .insert(webhook)
      .values({
        name: data.name,
        url: data.url,
        events: data.events,
        secret: data.secret,
        createdBy: data.createdBy,
      })
      .returning();
    return webhookResponseSchema.parse(created);
  }

  async update(
    id: string,
    data: UpdateWebhookInput,
  ): Promise<WebhookResponse | null> {
    const [updated] = await this.db
      .update(webhook)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(webhook.id, id))
      .returning();
    if (!updated) return null;
    return webhookResponseSchema.parse(updated);
  }

  async delete(id: string): Promise<WebhookResponse | null> {
    const [deleted] = await this.db
      .delete(webhook)
      .where(eq(webhook.id, id))
      .returning();
    if (!deleted) return null;
    return webhookResponseSchema.parse(deleted);
  }

  async createDelivery(data: {
    webhookId: string;
    event: string;
    payload: unknown;
    statusCode: number | null;
    response: string | null;
    success: boolean;
  }): Promise<WebhookDeliveryResponse> {
    const [created] = await this.db
      .insert(webhookDelivery)
      .values({
        webhookId: data.webhookId,
        event: data.event,
        payload: data.payload,
        statusCode: data.statusCode,
        response: data.response,
        success: data.success,
      })
      .returning();
    return webhookDeliveryResponseSchema.parse(created);
  }

  async findDeliveriesByWebhook(
    webhookId: string,
    page: number,
    limit: number,
  ): Promise<WebhookDeliveriesPaginatedResponse> {
    const offset = (page - 1) * limit;
    const where = eq(webhookDelivery.webhookId, webhookId);
    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(webhookDelivery)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(webhookDelivery.createdAt),
      this.db.select({ total: count() }).from(webhookDelivery).where(where),
    ]);
    return webhookDeliveriesPaginatedResponseSchema.parse({
      items,
      total,
      page,
      limit,
    });
  }
}
