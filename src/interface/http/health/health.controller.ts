import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Health check', description: 'Returns app and database status.' })
  @ApiOkResponse({
    schema: {
      example: { status: 'ok', db: 'ok', timestamp: '2026-01-01T00:00:00.000Z' },
    },
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'ok', timestamp: new Date().toISOString() };
  }
}