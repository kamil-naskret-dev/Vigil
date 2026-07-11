import { IMonitorRepository } from '../ports/monitor.repository.port';
import { PauseMonitorCommand } from './pause-monitor.command';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export class PauseMonitorHandler {
  constructor(private readonly monitorRepository: IMonitorRepository) {}

  async execute(command: PauseMonitorCommand): Promise<void> {
    const monitor = await this.monitorRepository.findById(command.monitorId);

    if (!monitor || monitor.userId !== command.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    monitor.pause();
    await this.monitorRepository.save(monitor);
  }
}