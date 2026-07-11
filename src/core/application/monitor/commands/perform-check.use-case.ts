import { randomUUID } from 'crypto';
import { IMonitorRepository } from '../ports/monitor.repository.port';
import { ICheckRepository } from '../ports/check.repository.port';
import { IHttpClient } from '../ports/http-client.port';
import { Check } from '../../../domain/check/check.entity';

export class PerformCheckUseCase {
  constructor(
    private readonly monitorRepository: IMonitorRepository,
    private readonly checkRepository: ICheckRepository,
    private readonly httpClient: IHttpClient,
  ) {}

  async execute(monitorId: string): Promise<void> {
    if (!monitorId) return;

    const monitor = await this.monitorRepository.findById(monitorId);

    if (!monitor || !monitor.isActive()) {
      return;
    }

    let check: Check;

    try {
      const result = await this.httpClient.check(monitor.url.value);

      const isUp = result.statusCode >= 200 && result.statusCode < 400;

      check = Check.create({
        id: randomUUID(),
        monitorId,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        isUp,
        error: null,
      });

      if (isUp) {
        monitor.recordSuccess();
      } else {
        monitor.recordFailure();
      }
    } catch (error) {
      check = Check.create({
        id: randomUUID(),
        monitorId,
        statusCode: null,
        responseTimeMs: null,
        isUp: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      monitor.recordFailure();
    }

    await this.checkRepository.save(check);
    await this.monitorRepository.save(monitor);
  }
}