import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AxiosHttpClient } from '../../infrastructure/http-client/axios-http-client';
import { PrismaCheckRepository } from '../../infrastructure/persistence/check.repository';
import { PrismaMonitorRepository } from '../../infrastructure/persistence/monitor.repository';
import { PrismaUserRepository } from '../../infrastructure/persistence/user.repository';
import { PrismaAlertChannelRepository } from '../../infrastructure/persistence/alert-channel.repository';
import {
  BullMQScheduler,
  CHECK_QUEUE,
} from '../../infrastructure/scheduler/bullmq.scheduler';
import { CheckWorker } from '../../infrastructure/scheduler/check.worker';
import { SchedulerBootstrapService } from '../../infrastructure/scheduler/scheduler-bootstrap.service';
import { NodemailerNotifier } from '../../infrastructure/notifications/nodemailer-notifier';
import { WebhookNotifier } from '../../infrastructure/notifications/webhook-notifier';
import { PerformCheckUseCase } from '../../core/application/monitor/commands/perform-check.use-case';
import { LOGGER_PORT, ILogger } from '../../core/application/ports/logger.port';
import { LoggerModule } from '../../infrastructure/logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({ name: CHECK_QUEUE }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: CHECK_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    AxiosHttpClient,
    PrismaCheckRepository,
    PrismaMonitorRepository,
    PrismaUserRepository,
    PrismaAlertChannelRepository,
    BullMQScheduler,
    CheckWorker,
    SchedulerBootstrapService,
    {
      provide: NodemailerNotifier,
      useFactory: (config: ConfigService) => new NodemailerNotifier(config),
      inject: [ConfigService],
    },
    WebhookNotifier,
    {
      provide: PerformCheckUseCase,
      useFactory: (
        monitorRepo: PrismaMonitorRepository,
        checkRepo: PrismaCheckRepository,
        httpClient: AxiosHttpClient,
        userRepo: PrismaUserRepository,
        notifier: NodemailerNotifier,
        channelRepo: PrismaAlertChannelRepository,
        webhookSender: WebhookNotifier,
        logger: ILogger,
      ) =>
        new PerformCheckUseCase(
          monitorRepo,
          checkRepo,
          httpClient,
          userRepo,
          notifier,
          channelRepo,
          webhookSender,
          logger,
        ),
      inject: [
        PrismaMonitorRepository,
        PrismaCheckRepository,
        AxiosHttpClient,
        PrismaUserRepository,
        NodemailerNotifier,
        PrismaAlertChannelRepository,
        WebhookNotifier,
        LOGGER_PORT,
      ],
    },
  ],
  exports: [BullMQScheduler, PerformCheckUseCase, PrismaAlertChannelRepository, PrismaCheckRepository],
})
export class CheckerModule {}