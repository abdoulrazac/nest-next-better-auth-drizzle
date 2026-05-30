// apps/backend/src/modules/files/files.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { S3Service } from './s3.service';
import { FilesRepository } from './files.repository';
import type { FileQuery } from '@repo/validators/files';
import { env } from '../../config/env';

@Injectable()
export class FilesService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly filesRepository: FilesRepository,
  ) {}

  async getPresignedUploadUrl(
    originalName: string,
    mimeType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const ext = originalName.split('.').pop() ?? 'bin';
    const key = `uploads/${randomUUID()}.${ext}`;
    const uploadUrl = await this.s3Service.getPresignedUploadUrl(key, mimeType);
    return { uploadUrl, key };
  }

  async confirmUpload(
    userId: string,
    data: {
      key: string;
      originalName: string;
      mimeType: string;
      size: number;
    },
  ) {
    const exists = await this.s3Service.objectExists(data.key);
    if (!exists) {
      throw new BadRequestException(
        `File not found in storage. Upload to the presigned URL first.`,
      );
    }

    const url = this.s3Service.getPublicUrl(data.key);
    const filename = data.key.split('/').pop() ?? data.key;

    return this.filesRepository.create({
      filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      bucket: env.S3_BUCKET,
      key: data.key,
      url,
      uploadedBy: userId,
    });
  }

  findAll(query: FileQuery) {
    return this.filesRepository.findAll(query);
  }

  async findById(id: string) {
    const found = await this.filesRepository.findById(id);
    if (!found) throw new NotFoundException(`File ${id} not found`);
    return found;
  }

  async delete(id: string) {
    const found = await this.findById(id);
    await this.s3Service.deleteObject(found.key);
    return this.filesRepository.delete(id);
  }
}
