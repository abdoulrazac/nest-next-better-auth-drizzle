// apps/backend/src/redis/redis.module.ts
import type { Env } from '@/config/env.schema';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

export const REDIS_TOKEN = 'REDIS';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_TOKEN,
      useFactory: (config: ConfigService<Env, true>) =>
        new IORedis(config.get('REDIS_URL', { infer: true })),
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_TOKEN],
})
export class RedisModule {}
