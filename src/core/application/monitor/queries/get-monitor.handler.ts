import { IMonitorRepository } from '../ports/monitor.repository.port';
import { GetMonitorQuery } from './get-monitor.query';
import { Monitor } from '../../../domain/monitor/monitor.entity';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export class GetMonitorHandler {
  constructor(private readonly monitorRepository: IMonitorRepository) {}

  async execute(query: GetMonitorQuery): Promise<Monitor> {
    const monitor = await this.monitorRepository.findById(query.monitorId);

    if (!monitor || monitor.userId !== query.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    return monitor;
  }
}