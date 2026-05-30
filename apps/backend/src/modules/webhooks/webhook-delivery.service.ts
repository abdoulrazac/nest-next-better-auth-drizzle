// apps/backend/src/modules/webhooks/webhook-delivery.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WebhooksRepository } from './webhooks.repository';

@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);

  constructor(
    private readonly webhooksRepository: WebhooksRepository,
    private readonly httpService: HttpService,
  ) {}

  async dispatch(event: string, payload: unknown): Promise<void> {
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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
      };
      if (hook.secret) {
        headers['X-Webhook-Secret'] = hook.secret;
      }

      const res = await firstValueFrom(
        this.httpService.post(hook.url, payload, {
          headers,
          timeout: 10000,
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
}
