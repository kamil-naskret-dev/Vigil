import type { AlertEvent } from './alert-event';

export interface IWebhookSender {
  send(event: AlertEvent, webhookUrl: string, secret: string): Promise<void>;
}