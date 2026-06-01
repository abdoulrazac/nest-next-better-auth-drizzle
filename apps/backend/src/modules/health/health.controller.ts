// apps/backend/src/modules/health/health.controller.ts
import { Controller, Get, VERSION_NEUTRAL, Res } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DbHealthIndicator } from './db-health.indicator';
import type { FastifyReply } from 'fastify';
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import {
  healthCheckResponseSchema,
  type HealthCheckResponse,
} from '@repo/validators/health';

@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DbHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check the health of the application' })
  @ApiZodOkResponse(healthCheckResponseSchema)
  @AllowAnonymous()
  async check(
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<HealthCheckResponse> {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    const health = await this.health.check([
      () => this.db.isHealthy('database'),
    ]);
    return healthCheckResponseSchema.parse(health);
  }
}
