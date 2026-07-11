import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { JwtPayload } from '../../../infrastructure/auth/jwt.strategy';
import { GetDashboardSummaryHandler } from '../../../core/application/monitor/queries/get-dashboard-summary.handler';
import { GetDashboardSummaryQuery } from '../../../core/application/monitor/queries/get-dashboard-summary.query';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly handler: GetDashboardSummaryHandler) {}

  @Get()
  async getSummary(@CurrentUser() user: JwtPayload) {
    return this.handler.execute(new GetDashboardSummaryQuery(user.sub));
  }
}