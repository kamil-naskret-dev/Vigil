import { IMonitorRepository } from '../ports/monitor.repository.port';
import { IScheduler } from '../ports/scheduler.port';
import { ResumeMonitorCommand } from './resume-monitor.command';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';
import { MonitorResumed } from '../../../domain/monitor/monitor.events';

export class ResumeMonitorHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(command: ResumeMonitorCommand): Promise<void> {
    const monitor = await this.monitorRepository.findById(command.monitorId);

    if (!monitor || monitor.userId !== command.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    monitor.resume();
    await this.monitorRepository.save(monitor);

    for (const event of monitor.pullEvents()) {
      if (event instanceof MonitorResumed) {
        await this.scheduler.addJob(event.monitorId, event.intervalMinutes);
      }
    }
  }
}