import { Module } from '@nestjs/common';
import { PrismaMonitorRepository } from '../../infrastructure/persistence/monitor.repository';
import { BullMQScheduler } from '../../infrastructure/scheduler/bullmq.scheduler';
import { CheckerModule } from './checker.module';
import { CreateMonitorHandler } from '../../core/application/monitor/commands/create-monitor.handler';
import { UpdateMonitorHandler } from '../../core/application/monitor/commands/update-monitor.handler';
import { DeleteMonitorHandler } from '../../core/application/monitor/commands/delete-monitor.handler';
import { PauseMonitorHandler } from '../../core/application/monitor/commands/pause-monitor.handler';
import { ResumeMonitorHandler } from '../../core/application/monitor/commands/resume-monitor.handler';
import { GetMonitorHandler } from '../../core/application/monitor/queries/get-monitor.handler';
import { ListMonitorsHandler } from '../../core/application/monitor/queries/list-monitors.handler';
import { MonitorController } from '../http/monitor/monitor.controller';

@Module({
  imports: [CheckerModule],
  controllers: [MonitorController],
  providers: [
    PrismaMonitorRepository,
    {
      provide: CreateMonitorHandler,
      useFactory: (repo: PrismaMonitorRepository, scheduler: BullMQScheduler) =>
        new CreateMonitorHandler(repo, scheduler),
      inject: [PrismaMonitorRepository, BullMQScheduler],
    },
    {
      provide: UpdateMonitorHandler,
      useFactory: (repo: PrismaMonitorRepository) => new UpdateMonitorHandler(repo),
      inject: [PrismaMonitorRepository],
    },
    {
      provide: DeleteMonitorHandler,
      useFactory: (repo: PrismaMonitorRepository, scheduler: BullMQScheduler) =>
        new DeleteMonitorHandler(repo, scheduler),
      inject: [PrismaMonitorRepository, BullMQScheduler],
    },
    {
      provide: PauseMonitorHandler,
      useFactory: (repo: PrismaMonitorRepository, scheduler: BullMQScheduler) =>
        new PauseMonitorHandler(repo, scheduler),
      inject: [PrismaMonitorRepository, BullMQScheduler],
    },
    {
      provide: ResumeMonitorHandler,
      useFactory: (repo: PrismaMonitorRepository, scheduler: BullMQScheduler) =>
        new ResumeMonitorHandler(repo, scheduler),
      inject: [PrismaMonitorRepository, BullMQScheduler],
    },
    {
      provide: GetMonitorHandler,
      useFactory: (repo: PrismaMonitorRepository) => new GetMonitorHandler(repo),
      inject: [PrismaMonitorRepository],
    },
    {
      provide: ListMonitorsHandler,
      useFactory: (repo: PrismaMonitorRepository) => new ListMonitorsHandler(repo),
      inject: [PrismaMonitorRepository],
    },
  ],
})
export class MonitorModule {}