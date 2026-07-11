import { randomUUID } from 'crypto';
import { IMonitorRepository } from '../ports/monitor.repository.port';
import { IAlertChannelRepository } from '../ports/alert-channel.repository.port';
import { AlertChannel } from '../../../domain/alert-channel/alert-channel.entity';
import { CreateAlertChannelCommand } from './create-alert-channel.command';
import { AppException } from '../../../domain/errors/app.exception';
import { ErrorCode } from '../../../domain/errors/error-codes.enum';

export class CreateAlertChannelHandler {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly channelRepository: IAlertChannelRepository,
  ) {}

  async execute(command: CreateAlertChannelCommand): Promise<{ id: string }> {
    const monitor = await this.monitorRepository.findById(command.monitorId);

    if (!monitor || monitor.userId !== command.userId) {
      throw AppException.notFound(ErrorCode.NOT_FOUND, 'Monitor not found');
    }

    const channel = AlertChannel.create({
      id: randomUUID(),
      monitorId: command.monitorId,
      url: command.url,
      secret: command.secret,
    });

    await this.channelRepository.save(channel);

    return { id: channel.id };
  }
}