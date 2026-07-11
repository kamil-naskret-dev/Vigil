import { IMonitorRepository } from '../ports/monitor.repository.port';
import { UpdateMonitorCommand } from './update-monitor.command';
import { CheckInterval } from '../../../domain/monitor/check-interval.value-object';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';
import { Monitor } from '../../../domain/monitor/monitor.entity';
import { MonitorUrl } from '../../../domain/monitor/monitor-url.value-object';
import { MonitorStatus } from '../../../domain/monitor/monitor-status.value-object';

export class UpdateMonitorHandler {
  constructor(private readonly monitorRepository: IMonitorRepository) {}

  async execute(command: UpdateMonitorCommand): Promise<void> {
    const monitor = await this.monitorRepository.findById(command.monitorId);

    if (!monitor || monitor.userId !== command.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    const updated = Monitor.create({
      id: monitor.id,
      userId: monitor.userId,
      name: command.name ?? monitor.name,
      url: MonitorUrl.create(monitor.url.value),
      interval: command.intervalMinutes
        ? CheckInterval.create(command.intervalMinutes)
        : monitor.interval,
      status: monitor.status as MonitorStatus,
      consecutiveFailures: monitor.consecutiveFailures,
      createdAt: monitor.createdAt,
    });

    await this.monitorRepository.save(updated);
  }
}