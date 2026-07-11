import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PerformCheckUseCase } from '../../core/application/monitor/commands/perform-check.use-case';
import { CHECK_QUEUE } from './bullmq.scheduler';

@Processor(CHECK_QUEUE)
export class CheckWorker extends WorkerHost {
  constructor(private readonly performCheck: PerformCheckUseCase) {
    super();
  }

  async process(job: Job<{ monitorId: string }>): Promise<void> {
    await this.performCheck.execute(job.data.monitorId);
  }
}