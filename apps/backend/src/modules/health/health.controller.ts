// apps/backend/src/modules/health/health.controller.ts
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import { Controller, Get, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckService } from '@nestjs/terminus';
import {
  healthCheckResponseSchema,
  type HealthCheckResponse,
} from '@repo/validators/health';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { FastifyReply } from 'fastify';
import { DbHealthIndicator } from './indicators/db-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { S3HealthIndicator } from './indicators/s3-health.indicator';
import { WsHealthIndicator } from './indicators/ws-health.indicator';

@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DbHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly s3: S3HealthIndicator,
    private readonly ws: WsHealthIndicator,
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
      () => this.redis.isHealthy('redis'),
      () => this.s3.isHealthy('s3'),
      () => this.ws.isHealthy('websocket'),
    ]);
    return healthCheckResponseSchema.parse(health);
  }
}
