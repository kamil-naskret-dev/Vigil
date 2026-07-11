import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../../infrastructure/auth/jwt.strategy';
import { CreateMonitorHandler } from '../../../core/application/monitor/commands/create-monitor.handler';
import { UpdateMonitorHandler } from '../../../core/application/monitor/commands/update-monitor.handler';
import { DeleteMonitorHandler } from '../../../core/application/monitor/commands/delete-monitor.handler';
import { PauseMonitorHandler } from '../../../core/application/monitor/commands/pause-monitor.handler';
import { ResumeMonitorHandler } from '../../../core/application/monitor/commands/resume-monitor.handler';
import { GetMonitorHandler } from '../../../core/application/monitor/queries/get-monitor.handler';
import { ListMonitorsHandler } from '../../../core/application/monitor/queries/list-monitors.handler';
import { CreateMonitorCommand } from '../../../core/application/monitor/commands/create-monitor.command';
import { UpdateMonitorCommand } from '../../../core/application/monitor/commands/update-monitor.command';
import { DeleteMonitorCommand } from '../../../core/application/monitor/commands/delete-monitor.command';
import { PauseMonitorCommand } from '../../../core/application/monitor/commands/pause-monitor.command';
import { ResumeMonitorCommand } from '../../../core/application/monitor/commands/resume-monitor.command';
import { GetMonitorQuery } from '../../../core/application/monitor/queries/get-monitor.query';
import { ListMonitorsQuery } from '../../../core/application/monitor/queries/list-monitors.query';
import { PerformCheckUseCase } from '../../../core/application/monitor/commands/perform-check.use-case';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@Controller('monitors')
@UseGuards(JwtAuthGuard)
export class MonitorController {
  constructor(
    private readonly createHandler: CreateMonitorHandler,
    private readonly updateHandler: UpdateMonitorHandler,
    private readonly deleteHandler: DeleteMonitorHandler,
    private readonly pauseHandler: PauseMonitorHandler,
    private readonly resumeHandler: ResumeMonitorHandler,
    private readonly getHandler: GetMonitorHandler,
    private readonly listHandler: ListMonitorsHandler,
    private readonly performCheck: PerformCheckUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMonitorDto, @CurrentUser() user: JwtPayload) {
    return this.createHandler.execute(
      new CreateMonitorCommand(
        user.sub,
        dto.name,
        dto.url,
        dto.intervalMinutes,
      ),
    );
  }

  @Get()
  async list(@CurrentUser() user: JwtPayload) {
    const monitors = await this.listHandler.execute(
      new ListMonitorsQuery(user.sub),
    );

    return monitors.map((m) => ({
      id: m.id,
      name: m.name,
      url: m.url.value,
      intervalMinutes: m.interval.minutes,
      status: m.status,
      consecutiveFailures: m.consecutiveFailures,
      createdAt: m.createdAt,
    }));
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const m = await this.getHandler.execute(new GetMonitorQuery(id, user.sub));

    return {
      id: m.id,
      name: m.name,
      url: m.url.value,
      intervalMinutes: m.interval.minutes,
      status: m.status,
      consecutiveFailures: m.consecutiveFailures,
      createdAt: m.createdAt,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMonitorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.updateHandler.execute(
      new UpdateMonitorCommand(id, user.sub, dto?.name, dto?.intervalMinutes),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.deleteHandler.execute(new DeleteMonitorCommand(id, user.sub));
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.NO_CONTENT)
  async pause(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.pauseHandler.execute(new PauseMonitorCommand(id, user.sub));
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resume(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.resumeHandler.execute(new ResumeMonitorCommand(id, user.sub));
  }

  @Post(':id/check')
  @HttpCode(HttpStatus.NO_CONTENT)
  async triggerCheck(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.getHandler.execute(new GetMonitorQuery(id, user.sub));
    await this.performCheck.execute(id);
  }
}
