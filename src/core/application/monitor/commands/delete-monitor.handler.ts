import { IMonitorRepository } from '../ports/monitor.repository.port';
import { IScheduler } from '../ports/scheduler.port';
import { DeleteMonitorCommand } from './delete-monitor.command';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export class DeleteMonitorHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly scheduler: IScheduler,
  ) {}

  async execute(command: DeleteMonitorCommand): Promise<void> {
    const monitor = await this.monitorRepository.findById(command.monitorId);

    if (!monitor || monitor.userId !== command.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    await this.monitorRepository.delete(command.monitorId);
    await this.scheduler.removeJob(command.monitorId);
  }
}