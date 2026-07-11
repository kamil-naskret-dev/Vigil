import { IMonitorRepository } from '../ports/monitor.repository.port';
import { ICheckRepository } from '../ports/check.repository.port';
import { GetMonitorStatsQuery, StatsPeriod } from './get-monitor-stats.query';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export interface MonitorStats {
  period: StatsPeriod;
  totalChecks: number;
  uptimePercent: number;
  avgResponseTimeMs: number | null;
  p50ResponseTimeMs: number | null;
  p95ResponseTimeMs: number | null;
  p99ResponseTimeMs: number | null;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function periodToMs(period: StatsPeriod): number {
  const map: Record<StatsPeriod, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  return map[period];
}

export class GetMonitorStatsHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly checkRepository: ICheckRepository,
  ) {}

  async execute(query: GetMonitorStatsQuery): Promise<MonitorStats> {
    const monitor = await this.monitorRepository.findById(query.monitorId);

    if (!monitor || monitor.userId !== query.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    const since = new Date(Date.now() - periodToMs(query.period));
    const samples = await this.checkRepository.findForStats(query.monitorId, since);

    if (samples.length === 0) {
      return {
        period: query.period,
        totalChecks: 0,
        uptimePercent: 0,
        avgResponseTimeMs: null,
        p50ResponseTimeMs: null,
        p95ResponseTimeMs: null,
        p99ResponseTimeMs: null,
      };
    }

    const upCount = samples.filter((s) => s.isUp).length;
    const uptimePercent = Math.round((upCount / samples.length) * 10000) / 100;

    const responseTimes = samples
      .filter((s) => s.responseTimeMs !== null)
      .map((s) => s.responseTimeMs as number)
      .sort((a, b) => a - b);

    const avg =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : null;

    return {
      period: query.period,
      totalChecks: samples.length,
      uptimePercent,
      avgResponseTimeMs: avg,
      p50ResponseTimeMs: percentile(responseTimes, 50),
      p95ResponseTimeMs: percentile(responseTimes, 95),
      p99ResponseTimeMs: percentile(responseTimes, 99),
    };
  }
}