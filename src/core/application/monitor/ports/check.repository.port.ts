import { Check } from '../../../domain/check/check.entity';

export interface CheckHistoryFilters {
  from?: Date;
  to?: Date;
  limit: number;
  page: number;
}

export interface CheckHistoryResult {
  data: Check[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsSample {
  isUp: boolean;
  responseTimeMs: number | null;
}

export interface MonitorSummaryStats {
  monitorId: string;
  total: number;
  upCount: number;
}

export interface ICheckRepository {
  save(check: Check): Promise<void>;
  findByMonitor(monitorId: string, limit?: number): Promise<Check[]>;
  findHistory(monitorId: string, filters: CheckHistoryFilters): Promise<CheckHistoryResult>;
  findForStats(monitorId: string, since: Date): Promise<StatsSample[]>;
  findSummaryStats(monitorIds: string[], since: Date): Promise<MonitorSummaryStats[]>;
}