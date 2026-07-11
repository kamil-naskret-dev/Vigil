import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AxiosHttpClient } from '../../infrastructure/http-client/axios-http-client';
import { PrismaCheckRepository } from '../../infrastructure/persistence/check.repository';
import { PrismaMonitorRepository } from '../../infrastructure/persistence/monitor.repository';
import { BullMQScheduler, CHECK_QUEUE } from '../../infrastructure/scheduler/bullmq.scheduler';
import { CheckWorker } from '../../infrastructure/scheduler/check.worker';
import { PerformCheckUseCase } from '../../core/application/monitor/commands/perform-check.use-case';

@Module({
  imports: [
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
    BullMQScheduler,
    CheckWorker,
    {
      provide: PerformCheckUseCase,
      useFactory: (
        monitorRepo: PrismaMonitorRepository,
        checkRepo: PrismaCheckRepository,
        httpClient: AxiosHttpClient,
      ) => new PerformCheckUseCase(monitorRepo, checkRepo, httpClient),
      inject: [PrismaMonitorRepository, PrismaCheckRepository, AxiosHttpClient],
    },
  ],
  exports: [BullMQScheduler, PerformCheckUseCase],
})
export class CheckerModule {}