import { randomUUID } from 'crypto';
import { IMonitorRepository } from '../ports/monitor.repository.port';
import { IScheduler } from '../ports/scheduler.port';
import { CreateMonitorCommand } from './create-monitor.command';
import { Monitor } from '../../../domain/monitor/monitor.entity';
import { MonitorUrl } from '../../../domain/monitor/monitor-url.value-object';
import { CheckInterval } from '../../../domain/monitor/check-interval.value-object';
import { MonitorCreated } from '../../../domain/monitor/monitor.events';

export class CreateMonitorHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(command: CreateMonitorCommand): Promise<{ id: string }> {
    const url = MonitorUrl.create(command.url);
    const interval = CheckInterval.create(command.intervalMinutes);

    const monitor = Monitor.create({
      id: randomUUID(),
      userId: command.userId,
      name: command.name,
      url,
      interval,
    });

    await this.monitorRepository.save(monitor);

    for (const event of monitor.pullEvents()) {
      if (event instanceof MonitorCreated) {
        await this.scheduler.addJob(event.monitorId, event.intervalMinutes);
      }
    }

    return { id: monitor.id };
  }
}