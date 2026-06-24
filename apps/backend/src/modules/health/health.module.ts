// apps/backend/src/modules/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DbHealthIndicator } from './indicators/db-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { S3HealthIndicator } from './indicators/s3-health.indicator';
import { WsHealthIndicator } from './indicators/ws-health.indicator';

@Module({
  imports: [TerminusModule.forRoot()],
  controllers: [HealthController],
  providers: [
    DbHealthIndicator,
    RedisHealthIndicator,
    S3HealthIndicator,
    WsHealthIndicator,
  ],
})
export class HealthModule {}
