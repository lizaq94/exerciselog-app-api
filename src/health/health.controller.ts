import { Controller, Get } from '@nestjs/common';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly primsHealthIndicator: PrismaHealthIndicator,
    private readonly health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.primsHealthIndicator.isHealthy('database'),
    ]);
  }
}
