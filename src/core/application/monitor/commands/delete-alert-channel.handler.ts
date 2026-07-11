import { IMonitorRepository } from '../ports/monitor.repository.port';
import { IAlertChannelRepository } from '../ports/alert-channel.repository.port';
import { DeleteAlertChannelCommand } from './delete-alert-channel.command';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export class DeleteAlertChannelHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly channelRepository: IAlertChannelRepository,
  ) {}

  async execute(command: DeleteAlertChannelCommand): Promise<void> {
    const monitor = await this.monitorRepository.findById(command.monitorId);

    if (!monitor || monitor.userId !== command.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    const channel = await this.channelRepository.findById(command.channelId);

    if (!channel || channel.monitorId !== command.monitorId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Alert channel not found');
    }

    await this.channelRepository.delete(command.channelId);
  }
}