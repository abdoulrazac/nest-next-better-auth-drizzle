// apps/backend/src/modules/messaging/presence/presence.service.ts
import { REDIS_TOKEN } from '@/redis/redis.module';
import { Inject, Injectable } from '@nestjs/common';
import IORedis from 'ioredis';

const PRESENCE_TTL = 35; // seconds (slightly > 20s heartbeat interval)
const key = (userId: string) => `user:presence:${userId}`;

@Injectable()
export class PresenceService {
  constructor(@Inject(REDIS_TOKEN) private readonly redis: IORedis) {}

  async setOnline(userId: string): Promise<void> {
    await this.redis.set(key(userId), '1', 'EX', PRESENCE_TTL);
  }

  async setOffline(userId: string): Promise<void> {
    await this.redis.del(key(userId));
  }

  async isOnline(userId: string): Promise<boolean> {
    return (await this.redis.get(key(userId))) !== null;
  }

  async refreshTtl(userId: string): Promise<void> {
    await this.redis.expire(key(userId), PRESENCE_TTL);
  }
}
