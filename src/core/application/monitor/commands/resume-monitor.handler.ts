import { IMonitorRepository } from '../ports/monitor.repository.port';
import { ResumeMonitorCommand } from './resume-monitor.command';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export class ResumeMonitorHandler {
  constructor(private readonly monitorRepository: IMonitorRepository) {}

  async execute(command: ResumeMonitorCommand): Promise<void> {
    const monitor = await this.monitorRepository.findById(command.monitorId);

    if (!monitor || monitor.userId !== command.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    monitor.resume();
    await this.monitorRepository.save(monitor);
  }
}