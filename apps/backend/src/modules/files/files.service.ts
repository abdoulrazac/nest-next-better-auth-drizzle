// apps/backend/src/modules/files/files.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { S3Service } from './s3.service';
import { FilesRepository } from './files.repository';
import {
  fileResponseSchema,
  filesPaginatedResponseSchema,
  presignedUrlResponseSchema,
  type FileQuery,
  type FileResponse,
  type FilesPaginatedResponse,
  type PresignedUrlResponse,
} from '@repo/validators/files';
import type { Env } from '@/config/env.schema';

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
    const exists = await this.s3Service.objectExists(data.key);
    if (!exists) {
      throw new BadRequestException(
        `File not found in storage. Upload to the presigned URL first.`,
      );
    }

    const url = this.s3Service.getPublicUrl(data.key);
    const filename = data.key.split('/').pop() ?? data.key;

    const file = await this.filesRepository.create({
      filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
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
