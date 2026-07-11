import { Injectable } from '@nestjs/common';
import { IMonitorRepository } from '../../core/application/monitor/ports/monitor.repository.port';
import { Monitor } from '../../core/domain/monitor/monitor.entity';
import { MonitorUrl } from '../../core/domain/monitor/monitor-url.value-object';
import { CheckInterval } from '../../core/domain/monitor/check-interval.value-object';
import { MonitorStatus } from '../../core/domain/monitor/monitor-status.value-object';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaMonitorRepository implements IMonitorRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: {
    id: string;
    userId: string;
    name: string;
    url: string;
    intervalMinutes: number;
    status: string;
    consecutiveFailures: number;
    createdAt: Date;
  }): Monitor {
    return Monitor.create({
      id: record.id,
      userId: record.userId,
      name: record.name,
      url: MonitorUrl.create(record.url),
      interval: CheckInterval.create(record.intervalMinutes),
      status: record.status as MonitorStatus,
      consecutiveFailures: record.consecutiveFailures,
      createdAt: record.createdAt,
    });
  }

  async findById(id: string): Promise<Monitor | null> {
    const record = await this.prisma.monitor.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAllByUser(userId: string): Promise<Monitor[]> {
    const records = await this.prisma.monitor.findMany({ where: { userId } });
    return records.map((r) => this.toDomain(r));
  }

  async findAllActive(): Promise<Monitor[]> {
    const records = await this.prisma.monitor.findMany({
      where: { status: { not: 'PAUSED' } },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(monitor: Monitor): Promise<void> {
    await this.prisma.monitor.upsert({
      where: { id: monitor.id },
      update: {
        name: monitor.name,
        url: monitor.url.value,
        intervalMinutes: monitor.interval.minutes,
        status: monitor.status,
        consecutiveFailures: monitor.consecutiveFailures,
      },
      create: {
        id: monitor.id,
        userId: monitor.userId,
        name: monitor.name,
        url: monitor.url.value,
        intervalMinutes: monitor.interval.minutes,
        status: monitor.status,
        consecutiveFailures: monitor.consecutiveFailures,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.monitor.delete({ where: { id } });
  }
}
