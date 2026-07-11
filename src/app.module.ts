import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './interface/modules/auth.module';
import { MonitorModule } from './interface/modules/monitor.module';
import { CheckerModule } from './interface/modules/checker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    MonitorModule,
    CheckerModule,
  ],
})
export class AppModule {}
