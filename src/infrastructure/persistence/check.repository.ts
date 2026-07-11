import { Injectable } from '@nestjs/common';
import {
  ICheckRepository,
  CheckHistoryFilters,
  CheckHistoryResult,
  StatsSample,
} from '../../core/application/monitor/ports/check.repository.port';
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

  async findHistory(monitorId: string, filters: CheckHistoryFilters): Promise<CheckHistoryResult> {
    const where = {
      monitorId,
      ...(filters.from || filters.to
        ? {
            checkedAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.check.findMany({
        where,
        orderBy: { checkedAt: 'desc' },
        take: filters.limit,
        skip: (filters.page - 1) * filters.limit,
      }),
      this.prisma.check.count({ where }),
    ]);

    return {
      data: records.map((r) => Check.create(r)),
      total,
      page: filters.page,
      limit: filters.limit,
    };
  }

  async findForStats(monitorId: string, since: Date): Promise<StatsSample[]> {
    return this.prisma.check.findMany({
      where: { monitorId, checkedAt: { gte: since } },
      select: { isUp: true, responseTimeMs: true },
      orderBy: { checkedAt: 'asc' },
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