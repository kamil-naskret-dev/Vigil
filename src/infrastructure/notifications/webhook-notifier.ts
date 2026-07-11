import { createHmac } from 'crypto';
import type { IWebhookSender } from '../../core/application/monitor/ports/webhook-sender.port';
import type { AlertEvent } from '../../core/application/monitor/ports/alert-event';

export class WebhookNotifier implements IWebhookSender {
  async send(
    event: AlertEvent,
    webhookUrl: string,
    secret: string,
  ): Promise<void> {
    const payload = JSON.stringify({
      type: event.type,
      monitorId: event.monitorId,
      monitorName: event.monitorName,
      url: event.url,
      occurredAt: event.occurredAt.toISOString(),
    });

    const signature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vigil-Signature': `sha256=${signature}`,
      },
      body: payload,
    });
  }
}
