import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import type { INotifier } from '../../core/application/monitor/ports/notifier.port';
import type { AlertEvent } from '../../core/application/monitor/ports/alert-event';

@Injectable()
export class NodemailerNotifier implements INotifier {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.transporter = createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port: config.getOrThrow<number>('SMTP_PORT'),
      secure: config.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: config.getOrThrow<string>('SMTP_USER'),
        pass: config.getOrThrow<string>('SMTP_PASS'),
      },
    });

    this.from = config.getOrThrow<string>('SMTP_FROM');
  }

  async notify(event: AlertEvent): Promise<void> {
    if (!event.recipientEmail) return;
    const subject =
      event.type === 'DEGRADED'
        ? `🔴 [Vigil] ${event.monitorName} is DOWN`
        : `🟢 [Vigil] ${event.monitorName} recovered`;

    const html =
      event.type === 'DEGRADED'
        ? `<p>Your monitor <strong>${event.monitorName}</strong> (<a href="${event.url}">${event.url}</a>) is <strong>DOWN</strong>.</p>
           <p>Time: ${event.occurredAt.toISOString()}</p>`
        : `<p>Your monitor <strong>${event.monitorName}</strong> (<a href="${event.url}">${event.url}</a>) has <strong>recovered</strong>.</p>
           <p>Time: ${event.occurredAt.toISOString()}</p>`;

    await this.transporter.sendMail({
      from: this.from,
      to: event.recipientEmail,
      subject,
      html,
    });
  }
}
