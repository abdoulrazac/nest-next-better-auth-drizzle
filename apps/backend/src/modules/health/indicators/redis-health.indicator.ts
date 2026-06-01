// apps/backend/src/modules/health/indicators/redis-health.indicator.ts
import { REDIS_TOKEN } from '@/redis/redis.module';
import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import type IORedis from 'ioredis';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    @Inject(REDIS_TOKEN) private readonly redis: IORedis,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    try {
      const pong = await this.redis.ping();
      if (pong !== 'PONG') {
        throw new Error(`Unexpected ping response: ${pong as string}`);
      }
      return indicator.up();
    } catch (err) {
      return indicator.down({ message: (err as Error).message });
    }
  }
}
