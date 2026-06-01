// apps/backend/src/modules/health/indicators/s3-health.indicator.ts
import type { Env } from '@/config/env.schema';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class S3HealthIndicator {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {
    this.bucket = this.config.get('S3_BUCKET', { infer: true });
    this.client = new S3Client({
      endpoint: this.config.get('S3_ENDPOINT', { infer: true }),
      region: this.config.get('S3_REGION', { infer: true }),
      credentials: {
        accessKeyId: this.config.get('S3_ACCESS_KEY', { infer: true }),
        secretAccessKey: this.config.get('S3_SECRET_KEY', { infer: true }),
      },
      forcePathStyle: true,
    });
  }

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return indicator.up();
    } catch (err) {
      return indicator.down({ message: (err as Error).message });
    }
  }
}
