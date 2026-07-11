export interface IScheduler {
  addJob(monitorId: string, intervalMinutes: number): Promise<void>;
  removeJob(monitorId: string): Promise<void>;
}