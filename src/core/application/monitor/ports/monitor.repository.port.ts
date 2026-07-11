import { Monitor } from '../../../domain/monitor/monitor.entity';

export interface IMonitorRepository {
  findById(id: string): Promise<Monitor | null>;
  findAllByUser(userId: string): Promise<Monitor[]>;
  save(monitor: Monitor): Promise<void>;
  delete(id: string): Promise<void>;
}