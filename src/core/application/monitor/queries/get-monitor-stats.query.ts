export type StatsPeriod = '24h' | '7d' | '30d';

export class GetMonitorStatsQuery {
  constructor(
    public readonly monitorId: string,
    public readonly userId: string,
    public readonly period: StatsPeriod = '7d',
  ) {}
}