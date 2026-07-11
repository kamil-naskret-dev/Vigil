export interface AlertEvent {
  type: 'DEGRADED' | 'RECOVERED';
  monitorId: string;
  monitorName: string;
  url: string;
  recipientEmail?: string;
  occurredAt: Date;
}
