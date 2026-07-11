import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApiAuthResponses } from '../../../infrastructure/swagger/swagger-responses';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../../infrastructure/auth/jwt.strategy';
import { GetDashboardSummaryHandler } from '../../../core/application/monitor/queries/get-dashboard-summary.handler';
import { GetDashboardSummaryQuery } from '../../../core/application/monitor/queries/get-dashboard-summary.query';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly handler: GetDashboardSummaryHandler) {}

  @ApiOperation({ summary: 'Get dashboard summary', description: 'Returns monitor counts by status, list of currently degraded monitors, and overall uptime % across all monitors for the last 24h.' })
  @ApiOkResponse({ description: 'Dashboard summary', schema: { example: { monitors: { total: 5, active: 3, paused: 1, degraded: 1 }, recentIncidents: [{ monitorId: 'cuid123', name: 'My API', url: 'https://api.example.com' }], overallUptimePercent: 97.5 } } })
  @ApiAuthResponses()
  @Get()
  async getSummary(@CurrentUser() user: JwtPayload) {
    return this.handler.execute(new GetDashboardSummaryQuery(user.sub));
  }
}