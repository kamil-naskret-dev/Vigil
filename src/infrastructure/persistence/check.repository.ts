import { Injectable } from '@nestjs/common';
import { ICheckRepository } from '../../core/application/monitor/ports/check.repository.port';
import { Check } from '../../core/domain/check/check.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaCheckRepository implements ICheckRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(check: Check): Promise<void> {
    await this.prisma.check.create({
      data: {
        id: check.id,
        monitorId: check.monitorId,
        statusCode: check.statusCode,
        responseTimeMs: check.responseTimeMs,
        isUp: check.isUp,
        error: check.error,
        checkedAt: check.checkedAt,
      },
    });
  }

  async findByMonitor(monitorId: string, limit = 100): Promise<Check[]> {
    const records = await this.prisma.check.findMany({
      where: { monitorId },
      orderBy: { checkedAt: 'desc' },
      take: limit,
    });

    return records.map((r) =>
      Check.create({
        id: r.id,
        monitorId: r.monitorId,
        statusCode: r.statusCode,
        responseTimeMs: r.responseTimeMs,
        isUp: r.isUp,
        error: r.error,
        checkedAt: r.checkedAt,
      }),
    );
  }
}