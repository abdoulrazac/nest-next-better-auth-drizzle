// apps/backend/src/modules/files/files.module.ts
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';
import { S3Service } from './s3.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesRepository, S3Service],
  exports: [S3Service, FilesService],
})
export class FilesModule {}
