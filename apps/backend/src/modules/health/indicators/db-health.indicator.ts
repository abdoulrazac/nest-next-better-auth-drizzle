// apps/backend/src/modules/health/indicators/db-health.indicator.ts
import { DATABASE_TOKEN } from '@/database/database.module';
import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import type { db as DbType } from '@repo/db';
import { sql } from 'drizzle-orm';

type DB = typeof DbType;

@Injectable()
export class DbHealthIndicator {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DB,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await this.db.execute(sql`SELECT 1`);
      return indicator.up();
    } catch (err) {
      return indicator.down({ message: (err as Error).message });
    }
  }
}
