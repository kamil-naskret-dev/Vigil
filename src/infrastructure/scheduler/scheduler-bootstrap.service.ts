import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaMonitorRepository } from '../persistence/monitor.repository';
import { BullMQScheduler } from './bullmq.scheduler';

@Injectable()
export class SchedulerBootstrapService implements OnApplicationBootstrap {
  constructor(
    private readonly monitorRepository: PrismaMonitorRepository,
    private readonly scheduler: BullMQScheduler,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const activeMonitors = await this.monitorRepository.findAllActive();

    for (const monitor of activeMonitors) {
      await this.scheduler.addJob(monitor.id, monitor.interval.minutes);
    }
  }
}