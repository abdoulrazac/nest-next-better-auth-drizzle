// apps/backend/src/modules/webhooks/webhook-delivery.service.ts
import { DomainEvent, type WebhookDispatchEvent } from '@/events/domain-events';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { createHmac } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { WebhooksRepository } from './webhooks.repository';
import { assertSafeWebhookUrl } from './webhook-ssrf.guard';

@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);

  constructor(
    private readonly webhooksRepository: WebhooksRepository,
    private readonly httpService: HttpService,
  ) {}

  @OnEvent(DomainEvent.WEBHOOK_DISPATCH)
  async onWebhookDispatch({
    event,
    payload,
  }: WebhookDispatchEvent): Promise<void> {
    const hooks = await this.webhooksRepository.findActiveByEvent(event);
    await Promise.allSettled(
      hooks.map((hook) => this.deliverOne(hook, event, payload)),
    );
  }

  private async deliverOne(
    hook: { id: string; url: string; secret: string | null },
    event: string,
    payload: unknown,
  ): Promise<void> {
    let statusCode: number | null = null;
    let response: string | null = null;
    let success = false;

    try {
      await assertSafeWebhookUrl(hook.url);

      const body = JSON.stringify(payload);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
      };

      if (hook.secret) {
        // Authenticity + integrity: HMAC-SHA256 of the body keyed by the
        // webhook secret. Recipients should verify this signature instead of
        // comparing the raw secret. The legacy X-Webhook-Secret header is
        // kept for backward compatibility with existing consumers.
        headers['X-Webhook-Signature'] = this.sign(body, hook.secret);
        headers['X-Webhook-Secret'] = hook.secret;
      }

      const res = await firstValueFrom(
        this.httpService.post(hook.url, body, {
          headers,
          timeout: 10000,
          // Never follow redirects: a 30x could bounce the request to an
          // internal host and bypass the SSRF check above.
          maxRedirects: 0,
          maxContentLength: 1_000_000,
        }),
      );
      statusCode = res.status;
      response =
        typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      success = res.status >= 200 && res.status < 300;
    } catch (err: unknown) {
      const e = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      statusCode = e.response?.status ?? null;
      response = e.response?.data
        ? JSON.stringify(e.response.data)
        : (e.message ?? 'Unknown error');
      success = false;
      this.logger.warn(
        `Webhook delivery failed for hook ${hook.id} (${hook.url}): ${response}`,
      );
    }

    await this.webhooksRepository.createDelivery({
      webhookId: hook.id,
      event,
      payload,
      statusCode,
      response,
      success,
    });
  }

  /**
   * Computes the HMAC-SHA256 signature of `body` using `secret`. Recipients
   * verify it with:
   *
   *   const mac = crypto.createHmac('sha256', secret).update(body).digest('hex');
   *   crypto.timingSafeEqual(Buffer.from(`sha256=${mac}`), Buffer.from(received));
   */
  private sign(body: string, secret: string): string {
    const mac = createHmac('sha256', secret).update(body).digest('hex');
    return `sha256=${mac}`;
  }
}
