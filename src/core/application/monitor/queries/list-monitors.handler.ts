import { IMonitorRepository } from '../ports/monitor.repository.port';
import { ListMonitorsQuery } from './list-monitors.query';
import { Monitor } from '../../../domain/monitor/monitor.entity';

export class ListMonitorsHandler {
  constructor(private readonly monitorRepository: IMonitorRepository) {}

  async execute(query: ListMonitorsQuery): Promise<Monitor[]> {
    return this.monitorRepository.findAllByUser(query.userId);
  }
}