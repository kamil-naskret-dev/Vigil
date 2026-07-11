import { Module } from '@nestjs/common';
import { PrismaMonitorRepository } from '../../infrastructure/persistence/monitor.repository';
import { PrismaAlertChannelRepository } from '../../infrastructure/persistence/alert-channel.repository';
import { PrismaCheckRepository } from '../../infrastructure/persistence/check.repository';
import { BullMQScheduler } from '../../infrastructure/scheduler/bullmq.scheduler';
import { CheckerModule } from './checker.module';
import { CreateMonitorHandler } from '../../core/application/monitor/commands/create-monitor.handler';
import { UpdateMonitorHandler } from '../../core/application/monitor/commands/update-monitor.handler';
import { DeleteMonitorHandler } from '../../core/application/monitor/commands/delete-monitor.handler';
import { PauseMonitorHandler } from '../../core/application/monitor/commands/pause-monitor.handler';
import { ResumeMonitorHandler } from '../../core/application/monitor/commands/resume-monitor.handler';
import { CreateAlertChannelHandler } from '../../core/application/monitor/commands/create-alert-channel.handler';
import { DeleteAlertChannelHandler } from '../../core/application/monitor/commands/delete-alert-channel.handler';
import { GetMonitorHandler } from '../../core/application/monitor/queries/get-monitor.handler';
import { ListMonitorsHandler } from '../../core/application/monitor/queries/list-monitors.handler';
import { ListAlertChannelsHandler } from '../../core/application/monitor/queries/list-alert-channels.handler';
import { GetCheckHistoryHandler } from '../../core/application/monitor/queries/get-check-history.handler';
import { GetMonitorStatsHandler } from '../../core/application/monitor/queries/get-monitor-stats.handler';
import { GetDashboardSummaryHandler } from '../../core/application/monitor/queries/get-dashboard-summary.handler';
import { MonitorController } from '../http/monitor/monitor.controller';
import { DashboardController } from '../http/dashboard/dashboard.controller';

@Module({
  imports: [CheckerModule],
  controllers: [MonitorController, DashboardController],
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
    {
      provide: CreateAlertChannelHandler,
      useFactory: (
        monitorRepo: PrismaMonitorRepository,
        channelRepo: PrismaAlertChannelRepository,
      ) => new CreateAlertChannelHandler(monitorRepo, channelRepo),
      inject: [PrismaMonitorRepository, PrismaAlertChannelRepository],
    },
    {
      provide: DeleteAlertChannelHandler,
      useFactory: (
        monitorRepo: PrismaMonitorRepository,
        channelRepo: PrismaAlertChannelRepository,
      ) => new DeleteAlertChannelHandler(monitorRepo, channelRepo),
      inject: [PrismaMonitorRepository, PrismaAlertChannelRepository],
    },
    {
      provide: ListAlertChannelsHandler,
      useFactory: (
        monitorRepo: PrismaMonitorRepository,
        channelRepo: PrismaAlertChannelRepository,
      ) => new ListAlertChannelsHandler(monitorRepo, channelRepo),
      inject: [PrismaMonitorRepository, PrismaAlertChannelRepository],
    },
    {
      provide: GetCheckHistoryHandler,
      useFactory: (
        monitorRepo: PrismaMonitorRepository,
        checkRepo: PrismaCheckRepository,
      ) => new GetCheckHistoryHandler(monitorRepo, checkRepo),
      inject: [PrismaMonitorRepository, PrismaCheckRepository],
    },
    {
      provide: GetMonitorStatsHandler,
      useFactory: (
        monitorRepo: PrismaMonitorRepository,
        checkRepo: PrismaCheckRepository,
      ) => new GetMonitorStatsHandler(monitorRepo, checkRepo),
      inject: [PrismaMonitorRepository, PrismaCheckRepository],
    },
    {
      provide: GetDashboardSummaryHandler,
      useFactory: (
        monitorRepo: PrismaMonitorRepository,
        checkRepo: PrismaCheckRepository,
      ) => new GetDashboardSummaryHandler(monitorRepo, checkRepo),
      inject: [PrismaMonitorRepository, PrismaCheckRepository],
    },
  ],
})
export class MonitorModule {}