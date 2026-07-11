import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger.config';
import { WinstonLoggerAdapter } from './winston-logger.adapter';
import { LOGGER_PORT } from '../../core/application/ports/logger.port';

@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [
    WinstonLoggerAdapter,
    {
      provide: LOGGER_PORT,
      useExisting: WinstonLoggerAdapter,
    },
  ],
  exports: [LOGGER_PORT, WinstonModule],
})
export class LoggerModule {}
