// apps/backend/src/modules/files/files.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { FilesService } from './files.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '@/common/interceptors/audit-log.interceptor';
import {
  fileQuerySchema,
  presignedUrlRequestSchema,
  confirmUploadSchema,
  type FileQuery,
  type PresignedUrlRequest,
  type ConfirmUploadInput,
} from '@repo/validators/files';

@ApiTags('files')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: 'files', version: '1' })
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'List files' })
  @UserHasPermission({ permission: { files: ['read'] } })
  findAll(@Query(new ZodValidationPipe(fileQuerySchema)) query: FileQuery) {
    return this.filesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by id' })
  @UserHasPermission({ permission: { files: ['read'] } })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findById(id);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned upload URL' })
  @UserHasPermission({ permission: { files: ['upload'] } })
  getPresignedUrl(
    @Body(new ZodValidationPipe(presignedUrlRequestSchema))
    body: PresignedUrlRequest,
  ) {
    return this.filesService.getPresignedUploadUrl(
      body.originalName,
      body.mimeType,
    );
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm upload and register file metadata' })
  @UserHasPermission({ permission: { files: ['upload'] } })
  confirmUpload(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(confirmUploadSchema)) body: ConfirmUploadInput,
  ) {
    return this.filesService.confirmUpload(user.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  @UserHasPermission({ permission: { files: ['delete'] } })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.delete(id);
  }
}
