import { Injectable } from '@nestjs/common';
import {
  ICheckRepository,
  CheckHistoryFilters,
  CheckHistoryResult,
  StatsSample,
  MonitorSummaryStats,
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

  async findHistory(
    monitorId: string,
    filters: CheckHistoryFilters,
  ): Promise<CheckHistoryResult> {
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

  async findSummaryStats(monitorIds: string[], since: Date): Promise<MonitorSummaryStats[]> {
    if (monitorIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<
      { monitorId: string; total: bigint; up_count: bigint }[]
    >`
      SELECT "monitorId",
        COUNT(*)::bigint AS total,
        SUM(CASE WHEN "isUp" THEN 1 ELSE 0 END)::bigint AS up_count
      FROM "Check"
      WHERE "monitorId" = ANY(${monitorIds})
        AND "checkedAt" >= ${since}
      GROUP BY "monitorId"
    `;

    return rows.map((r) => ({
      monitorId: r.monitorId,
      total: Number(r.total),
      upCount: Number(r.up_count),
    }));
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
