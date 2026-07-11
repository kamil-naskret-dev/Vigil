import { Check } from '../../../domain/check/check.entity';

export interface ICheckRepository {
  save(check: Check): Promise<void>;
  findByMonitor(monitorId: string, limit?: number): Promise<Check[]>;
}