import { IMonitorRepository } from '../ports/monitor.repository.port';
import { IAlertChannelRepository } from '../ports/alert-channel.repository.port';
import { AlertChannel } from '../../../domain/alert-channel/alert-channel.entity';
import { ListAlertChannelsQuery } from './list-alert-channels.query';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export class ListAlertChannelsHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly channelRepository: IAlertChannelRepository,
  ) {}

  async execute(query: ListAlertChannelsQuery): Promise<AlertChannel[]> {
    const monitor = await this.monitorRepository.findById(query.monitorId);

    if (!monitor || monitor.userId !== query.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    return this.channelRepository.findByMonitorId(query.monitorId);
  }
}