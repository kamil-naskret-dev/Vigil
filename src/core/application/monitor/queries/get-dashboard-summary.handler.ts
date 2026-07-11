import { IMonitorRepository } from '../ports/monitor.repository.port';
import { ICheckRepository } from '../ports/check.repository.port';
import { GetDashboardSummaryQuery } from './get-dashboard-summary.query';
import { MonitorStatus } from '../../../domain/monitor/monitor-status.value-object';

export interface DashboardSummary {
  monitors: {
    total: number;
    active: number;
    paused: number;
    degraded: number;
  };
  recentIncidents: {
    monitorId: string;
    name: string;
    url: string;
  }[];
  overallUptimePercent: number | null;
}

export class GetDashboardSummaryHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly checkRepository: ICheckRepository,
  ) {}

  async execute(query: GetDashboardSummaryQuery): Promise<DashboardSummary> {
    const monitors = await this.monitorRepository.findAllByUser(query.userId);

    const counts = {
      total: monitors.length,
      active: monitors.filter((m) => m.status === MonitorStatus.ACTIVE).length,
      paused: monitors.filter((m) => m.status === MonitorStatus.PAUSED).length,
      degraded: monitors.filter((m) => m.status === MonitorStatus.DEGRADED).length,
    };

    const recentIncidents = monitors
      .filter((m) => m.status === MonitorStatus.DEGRADED)
      .map((m) => ({ monitorId: m.id, name: m.name, url: m.url.value }));

    if (monitors.length === 0) {
      return { monitors: counts, recentIncidents, overallUptimePercent: null };
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const monitorIds = monitors.map((m) => m.id);
    const statsRows = await this.checkRepository.findSummaryStats(monitorIds, since);

    if (statsRows.length === 0) {
      return { monitors: counts, recentIncidents, overallUptimePercent: null };
    }

    const totalChecks = statsRows.reduce((sum, r) => sum + r.total, 0);
    const totalUp = statsRows.reduce((sum, r) => sum + r.upCount, 0);
    const overallUptimePercent = Math.round((totalUp / totalChecks) * 10000) / 100;

    return { monitors: counts, recentIncidents, overallUptimePercent };
  }
}