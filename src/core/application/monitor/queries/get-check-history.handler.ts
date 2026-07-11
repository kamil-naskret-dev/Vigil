import { IMonitorRepository } from '../ports/monitor.repository.port';
import { ICheckRepository, CheckHistoryResult } from '../ports/check.repository.port';
import { GetCheckHistoryQuery } from './get-check-history.query';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export class GetCheckHistoryHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly checkRepository: ICheckRepository,
  ) {}

  async execute(query: GetCheckHistoryQuery): Promise<CheckHistoryResult> {
    const monitor = await this.monitorRepository.findById(query.monitorId);

    if (!monitor || monitor.userId !== query.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    return this.checkRepository.findHistory(query.monitorId, {
      from: query.from,
      to: query.to,
      limit: query.limit,
      page: query.page,
    });
  }
}