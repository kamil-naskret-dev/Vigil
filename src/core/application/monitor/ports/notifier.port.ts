import type { AlertEvent } from './alert-event';

export interface INotifier {
  notify(event: AlertEvent): Promise<void>;
}
