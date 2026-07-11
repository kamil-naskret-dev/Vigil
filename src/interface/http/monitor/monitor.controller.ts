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
  Query,
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
import { CreateAlertChannelHandler } from '../../../core/application/monitor/commands/create-alert-channel.handler';
import { DeleteAlertChannelHandler } from '../../../core/application/monitor/commands/delete-alert-channel.handler';
import { GetMonitorHandler } from '../../../core/application/monitor/queries/get-monitor.handler';
import { ListMonitorsHandler } from '../../../core/application/monitor/queries/list-monitors.handler';
import { ListAlertChannelsHandler } from '../../../core/application/monitor/queries/list-alert-channels.handler';
import { GetCheckHistoryHandler } from '../../../core/application/monitor/queries/get-check-history.handler';
import { GetMonitorStatsHandler } from '../../../core/application/monitor/queries/get-monitor-stats.handler';
import {
  GetMonitorStatsQuery,
  StatsPeriod,
} from '../../../core/application/monitor/queries/get-monitor-stats.query';
import { CreateMonitorCommand } from '../../../core/application/monitor/commands/create-monitor.command';
import { UpdateMonitorCommand } from '../../../core/application/monitor/commands/update-monitor.command';
import { DeleteMonitorCommand } from '../../../core/application/monitor/commands/delete-monitor.command';
import { PauseMonitorCommand } from '../../../core/application/monitor/commands/pause-monitor.command';
import { ResumeMonitorCommand } from '../../../core/application/monitor/commands/resume-monitor.command';
import { CreateAlertChannelCommand } from '../../../core/application/monitor/commands/create-alert-channel.command';
import { DeleteAlertChannelCommand } from '../../../core/application/monitor/commands/delete-alert-channel.command';
import { GetMonitorQuery } from '../../../core/application/monitor/queries/get-monitor.query';
import { ListMonitorsQuery } from '../../../core/application/monitor/queries/list-monitors.query';
import { ListAlertChannelsQuery } from '../../../core/application/monitor/queries/list-alert-channels.query';
import { GetCheckHistoryQuery } from '../../../core/application/monitor/queries/get-check-history.query';
import { PerformCheckUseCase } from '../../../core/application/monitor/commands/perform-check.use-case';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';
import { CreateAlertChannelDto } from './dto/create-alert-channel.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ApiAuthResponses,
  ApiNotFoundResponse,
  ApiValidationResponse,
} from '../../../infrastructure/swagger/swagger-responses';

@ApiTags('Monitors')
@ApiBearerAuth()
@Controller('monitors')
@UseGuards(JwtAuthGuard)
export class MonitorController {
  constructor(
    private readonly createHandler: CreateMonitorHandler,
    private readonly updateHandler: UpdateMonitorHandler,
    private readonly deleteHandler: DeleteMonitorHandler,
    private readonly pauseHandler: PauseMonitorHandler,
    private readonly resumeHandler: ResumeMonitorHandler,
    private readonly createChannelHandler: CreateAlertChannelHandler,
    private readonly deleteChannelHandler: DeleteAlertChannelHandler,
    private readonly getHandler: GetMonitorHandler,
    private readonly listHandler: ListMonitorsHandler,
    private readonly listChannelsHandler: ListAlertChannelsHandler,
    private readonly getCheckHistoryHandler: GetCheckHistoryHandler,
    private readonly getMonitorStatsHandler: GetMonitorStatsHandler,
    private readonly performCheck: PerformCheckUseCase,
  ) {}

  @ApiOperation({
    summary: 'Create a new monitor',
    description:
      'Creates a monitor and immediately schedules repeating checks at the given interval.',
  })
  @ApiCreatedResponse({
    description: 'Monitor created',
    schema: { example: { id: 'cuid123' } },
  })
  @ApiValidationResponse()
  @ApiAuthResponses()
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

  @ApiOperation({
    summary: 'List all monitors',
    description: 'Returns all monitors belonging to the authenticated user.',
  })
  @ApiOkResponse({
    description: 'List of monitors',
    schema: {
      example: [
        {
          id: 'cuid123',
          name: 'My API',
          url: 'https://api.example.com',
          intervalMinutes: 5,
          status: 'ACTIVE',
          consecutiveFailures: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiAuthResponses()
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

  @ApiOperation({ summary: 'Get a monitor by ID' })
  @ApiOkResponse({
    description: 'Monitor found',
    schema: {
      example: {
        id: 'cuid123',
        name: 'My API',
        url: 'https://api.example.com',
        intervalMinutes: 5,
        status: 'ACTIVE',
        consecutiveFailures: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
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

  @ApiOperation({
    summary: 'Update a monitor',
    description:
      'Updates name and/or interval. Changing interval automatically reschedules the BullMQ job.',
  })
  @ApiOkResponse({ description: 'Monitor updated' })
  @ApiValidationResponse()
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
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

  @ApiOperation({
    summary: 'Delete a monitor',
    description:
      'Deletes the monitor, removes its scheduled job and cascades to all check history and alert channels.',
  })
  @ApiNoContentResponse({ description: 'Monitor deleted' })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.deleteHandler.execute(new DeleteMonitorCommand(id, user.sub));
  }

  @ApiOperation({
    summary: 'Pause a monitor',
    description:
      'Stops all scheduled checks and removes the BullMQ job. Monitor status changes to PAUSED.',
  })
  @ApiNoContentResponse({ description: 'Monitor paused' })
  @ApiResponse({ status: 400, description: 'Monitor is already paused' })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
  @Post(':id/pause')
  @HttpCode(HttpStatus.NO_CONTENT)
  async pause(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.pauseHandler.execute(new PauseMonitorCommand(id, user.sub));
  }

  @ApiOperation({
    summary: 'Resume a paused monitor',
    description:
      'Restarts scheduled checks and re-registers the BullMQ job. Monitor status changes to ACTIVE.',
  })
  @ApiNoContentResponse({ description: 'Monitor resumed' })
  @ApiResponse({ status: 400, description: 'Monitor is not paused' })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
  @Post(':id/resume')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resume(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.resumeHandler.execute(new ResumeMonitorCommand(id, user.sub));
  }

  @ApiOperation({
    summary: 'Manually trigger a check',
    description:
      'Immediately performs a check outside of the scheduled interval. Useful for testing or after fixing a downtime.',
  })
  @ApiNoContentResponse({ description: 'Check triggered successfully' })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
  @Post(':id/check')
  @HttpCode(HttpStatus.NO_CONTENT)
  async triggerCheck(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.getHandler.execute(new GetMonitorQuery(id, user.sub));
    await this.performCheck.execute(id);
  }

  @ApiOperation({
    summary: 'Get check history',
    description:
      'Returns paginated check history ordered by most recent first. Supports date range filtering.',
  })
  @ApiOkResponse({
    description: 'Paginated check history',
    schema: {
      example: {
        data: [
          {
            id: 'cuid123',
            monitorId: 'cuid456',
            statusCode: 200,
            responseTimeMs: 142,
            isUp: true,
            error: null,
            checkedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        total: 150,
        page: 1,
        limit: 100,
      },
    },
  })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601)',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO 8601)',
    example: '2026-12-31',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Results per page (default: 100)',
    example: 100,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiTags('Checks')
  @Get(':id/checks')
  async getCheckHistory(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.getCheckHistoryHandler.execute(
      new GetCheckHistoryQuery(
        id,
        user.sub,
        from ? new Date(from) : undefined,
        to ? new Date(to) : undefined,
        limit ? parseInt(limit) : 100,
        page ? parseInt(page) : 1,
      ),
    );
  }

  @ApiOperation({
    summary: 'Get uptime and response time stats',
    description:
      'Returns uptime percentage and response time percentiles (p50, p95, p99) for the given period. Percentiles reveal slow outliers that the average hides.',
  })
  @ApiOkResponse({
    description: 'Monitor statistics',
    schema: {
      example: {
        period: '7d',
        totalChecks: 2016,
        uptimePercent: 99.85,
        avgResponseTimeMs: 145,
        p50ResponseTimeMs: 132,
        p95ResponseTimeMs: 310,
        p99ResponseTimeMs: 890,
      },
    },
  })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['24h', '7d', '30d'],
    description: 'Stats period (default: 7d)',
  })
  @ApiTags('Checks')
  @Get(':id/stats')
  async getStats(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query('period') period?: string,
  ) {
    return this.getMonitorStatsHandler.execute(
      new GetMonitorStatsQuery(id, user.sub, (period as StatsPeriod) ?? '7d'),
    );
  }

  @ApiOperation({
    summary: 'Add webhook alert channel',
    description:
      'Adds a webhook URL to receive DEGRADED and RECOVERED events. Payloads are signed with HMAC-SHA256 in the X-Vigil-Signature header for verification.',
  })
  @ApiCreatedResponse({
    description: 'Channel created',
    schema: { example: { id: 'cuid123' } },
  })
  @ApiValidationResponse()
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
  @Post(':id/channels')
  @HttpCode(HttpStatus.CREATED)
  async createChannel(
    @Param('id') id: string,
    @Body() dto: CreateAlertChannelDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.createChannelHandler.execute(
      new CreateAlertChannelCommand(id, user.sub, dto.url, dto.secret),
    );
  }

  @ApiOperation({ summary: 'List webhook alert channels' })
  @ApiOkResponse({
    description: 'List of webhook channels',
    schema: {
      example: [
        {
          id: 'cuid123',
          url: 'https://hooks.slack.com/...',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Monitor')
  @Get(':id/channels')
  async listChannels(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const channels = await this.listChannelsHandler.execute(
      new ListAlertChannelsQuery(id, user.sub),
    );
    return channels.map((c) => ({
      id: c.id,
      url: c.url,
      createdAt: c.createdAt,
    }));
  }

  @ApiOperation({ summary: 'Delete a webhook alert channel' })
  @ApiNoContentResponse({ description: 'Channel deleted' })
  @ApiAuthResponses()
  @ApiNotFoundResponse('Alert channel')
  @Delete(':id/channels/:channelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChannel(
    @Param('id') id: string,
    @Param('channelId') channelId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.deleteChannelHandler.execute(
      new DeleteAlertChannelCommand(channelId, id, user.sub),
    );
  }
}
