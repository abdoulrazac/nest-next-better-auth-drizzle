// apps/backend/src/modules/files/files.service.ts
import type { Env } from '@/config/env.schema';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  fileResponseSchema,
  filesPaginatedResponseSchema,
  presignedUrlResponseSchema,
  type FileQuery,
  type FileResponse,
  type FilesPaginatedResponse,
  type PresignedUrlResponse,
} from '@repo/validators/files';
import { randomUUID } from 'crypto';
import { FilesRepository } from './files.repository';
import { S3Service } from './s3.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly filesRepository: FilesRepository,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async getPresignedUploadUrl(
    originalName: string,
    mimeType: string,
  ): Promise<PresignedUrlResponse> {
    const ext = originalName.split('.').pop() ?? 'bin';
    const key = `uploads/${randomUUID()}.${ext}`;
    const uploadUrl = await this.s3Service.getPresignedUploadUrl(key, mimeType);
    return presignedUrlResponseSchema.parse({ uploadUrl, key });
  }

  async confirmUpload(
    userId: string,
    data: {
      key: string;
      originalName: string;
      mimeType: string;
      size: number;
    },
  ): Promise<FileResponse> {
    // Verify the object was actually uploaded
    const metadata = await this.s3Service
      .getObjectMetadata(data.key)
      .catch(() => null);
    if (!metadata) {
      throw new BadRequestException(
        `File not found in storage. Upload to the presigned URL first.`,
      );
    }

    // Use S3-reported values instead of trusting the client
    const actualMimeType =
      (metadata.contentType ?? data.mimeType).split(';')[0]?.trim() ??
      data.mimeType;
    const actualSize = metadata.contentLength ?? data.size;

    // Enforce MIME type allow-list against the real S3 Content-Type
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(actualMimeType)) {
      // Delete the disallowed object so storage isn't polluted
      await this.s3Service.deleteObject(data.key).catch(() => undefined);
      throw new BadRequestException(
        `File type '${actualMimeType}' is not allowed.`,
      );
    }

    // Enforce max size against the real S3 Content-Length
    if (actualSize > MAX_FILE_SIZE) {
      await this.s3Service.deleteObject(data.key).catch(() => undefined);
      throw new BadRequestException(
        `File exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
      );
    }

    const url = this.s3Service.getPublicUrl(data.key);
    const filename = data.key.split('/').pop() ?? data.key;

    const file = await this.filesRepository.create({
      filename,
      originalName: data.originalName,
      mimeType: actualMimeType,
      size: actualSize,
      bucket: this.config.get('S3_BUCKET', { infer: true }),
      key: data.key,
      url,
      uploadedBy: userId,
    });

    return fileResponseSchema.parse(file);
  }

  async findAll(query: FileQuery): Promise<FilesPaginatedResponse> {
    const files = await this.filesRepository.findAll(query);
    return filesPaginatedResponseSchema.parse(files);
  }

  async findById(id: string): Promise<FileResponse> {
    const found = await this.filesRepository.findById(id);
    if (!found) throw new NotFoundException(`File ${id} not found`);
    return fileResponseSchema.parse(found);
  }

  async delete(id: string): Promise<FileResponse | null> {
    const found = await this.findById(id);
    await this.s3Service.deleteObject(found.key);
    const deleted = await this.filesRepository.delete(id);
    if (!deleted) return null;
    return fileResponseSchema.parse(deleted);
  }
}
