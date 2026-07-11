import { Injectable } from '@nestjs/common';
import { IAlertChannelRepository } from '../../core/application/monitor/ports/alert-channel.repository.port';
import { AlertChannel } from '../../core/domain/alert-channel/alert-channel.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaAlertChannelRepository implements IAlertChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: {
    id: string;
    monitorId: string;
    url: string;
    secret: string;
    createdAt: Date;
  }): AlertChannel {
    return AlertChannel.create(record);
  }

  async findById(id: string): Promise<AlertChannel | null> {
    const record = await this.prisma.alertChannel.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByMonitorId(monitorId: string): Promise<AlertChannel[]> {
    const records = await this.prisma.alertChannel.findMany({
      where: { monitorId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(channel: AlertChannel): Promise<void> {
    await this.prisma.alertChannel.upsert({
      where: { id: channel.id },
      update: { url: channel.url, secret: channel.secret },
      create: {
        id: channel.id,
        monitorId: channel.monitorId,
        url: channel.url,
        secret: channel.secret,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.alertChannel.delete({ where: { id } });
  }
}
