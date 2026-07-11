import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IScheduler } from '../../core/application/monitor/ports/scheduler.port';

export const CHECK_QUEUE = 'checks';

@Injectable()
export class BullMQScheduler implements IScheduler {
  constructor(@InjectQueue(CHECK_QUEUE) private readonly queue: Queue) {}

  async addJob(monitorId: string, intervalMinutes: number): Promise<void> {
    await this.queue.add(
      'perform-check',
      { monitorId },
      {
        jobId: `monitor-${monitorId}`,
        repeat: { every: intervalMinutes * 60 * 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async removeJob(monitorId: string): Promise<void> {
    const repeatableJobs = await this.queue.getRepeatableJobs();
    const job = repeatableJobs.find((j) => j.id === `monitor-${monitorId}`);

    if (job) {
      await this.queue.removeRepeatableByKey(job.key);
    }
  }
}