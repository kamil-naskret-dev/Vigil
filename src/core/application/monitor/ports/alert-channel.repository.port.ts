import { AlertChannel } from '../../../domain/alert-channel/alert-channel.entity';

export interface IAlertChannelRepository {
  findById(id: string): Promise<AlertChannel | null>;
  findByMonitorId(monitorId: string): Promise<AlertChannel[]>;
  save(channel: AlertChannel): Promise<void>;
  delete(id: string): Promise<void>;
}