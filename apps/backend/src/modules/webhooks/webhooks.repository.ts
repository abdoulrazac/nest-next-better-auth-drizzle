// apps/backend/src/modules/webhooks/webhooks.repository.ts
import { Injectable } from '@nestjs/common';
import { db, webhook, webhookDelivery } from '@repo/db';
import { eq, count } from 'drizzle-orm';
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
} from '@repo/validators/webhooks';

@Injectable()
export class WebhooksRepository {
  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(webhook)
        .limit(limit)
        .offset(offset)
        .orderBy(webhook.createdAt),
      db.select({ total: count() }).from(webhook),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    const [found] = await db.select().from(webhook).where(eq(webhook.id, id));
    return found ?? null;
  }

  async findActiveByEvent(event: string) {
    const rows = await db
      .select()
      .from(webhook)
      .where(eq(webhook.active, true));
    return rows.filter((w) => w.events.includes(event));
  }

  async create(data: CreateWebhookInput & { createdBy?: string }) {
    const [created] = await db
      .insert(webhook)
      .values({
        name: data.name,
        url: data.url,
        events: data.events,
        secret: data.secret,
        createdBy: data.createdBy,
      })
      .returning();
    return created;
  }

  async update(id: string, data: UpdateWebhookInput) {
    const [updated] = await db
      .update(webhook)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(webhook.id, id))
      .returning();
    return updated ?? null;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(webhook)
      .where(eq(webhook.id, id))
      .returning();
    return deleted ?? null;
  }

  async createDelivery(data: {
    webhookId: string;
    event: string;
    payload: unknown;
    statusCode: number | null;
    response: string | null;
    success: boolean;
  }) {
    const [created] = await db
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
    return created;
  }

  async findDeliveriesByWebhook(
    webhookId: string,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;
    const where = eq(webhookDelivery.webhookId, webhookId);
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(webhookDelivery)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(webhookDelivery.createdAt),
      db.select({ total: count() }).from(webhookDelivery).where(where),
    ]);
    return { items, total, page, limit };
  }
}
