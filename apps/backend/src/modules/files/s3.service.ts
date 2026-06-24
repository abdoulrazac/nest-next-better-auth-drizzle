// apps/backend/src/modules/files/s3.service.ts
import type { Env } from '@/config/env.schema';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface S3ObjectMetadata {
  contentType?: string;
  contentLength?: number;
}

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  private readonly endpoint: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.bucket = this.config.get('S3_BUCKET', { infer: true });
    this.endpoint = this.config.get('S3_ENDPOINT', { infer: true });
    this.client = new S3Client({
      endpoint: this.endpoint,
      region: this.config.get('S3_REGION', { infer: true }),
      credentials: {
        accessKeyId: this.config.get('S3_ACCESS_KEY', { infer: true }),
        secretAccessKey: this.config.get('S3_SECRET_KEY', { infer: true }),
      },
      forcePathStyle: true,
    });
  }

  async getPresignedUploadUrl(key: string, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }

  /**
   * Returns a short-lived presigned GET URL for downloading a private object.
   * Use this instead of {@link getPublicUrl} for sensitive content (chat
   * attachments, user uploads) so that URLs are not permanently accessible.
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  getPublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns the actual ContentType and ContentLength stored on the S3 object.
   * Used by confirmUpload to verify the real file type and size instead of
   * trusting the client-supplied values.
   */
  async getObjectMetadata(key: string): Promise<S3ObjectMetadata> {
    const result = await this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return {
      contentType: result.ContentType,
      contentLength: result.ContentLength,
    };
  }
}
