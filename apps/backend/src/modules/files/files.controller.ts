// apps/backend/src/modules/files/files.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { Permissions } from '@/auth/permission';
import { ZodBody, ZodQuery } from '@/common/decorators/zod.decorators';
import { FilesService } from './files.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  ApiZodCreatedResponse,
  ApiZodOkResponse,
} from '@/common/decorators/zod-response.decorators';
import {
  fileResponseSchema,
  fileQuerySchema,
  filesPaginatedResponseSchema,
  presignedUrlRequestSchema,
  presignedUrlResponseSchema,
  confirmUploadSchema,
  type FileQuery,
  type FileResponse,
  type FilesPaginatedResponse,
  type PresignedUrlRequest,
  type PresignedUrlResponse,
  type ConfirmUploadInput,
} from '@repo/validators/files';

@ApiTags('files')
@ApiBearerAuth()
@Controller({ path: 'files', version: '1' })
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'List files' })
  @ApiZodOkResponse(filesPaginatedResponseSchema)
  @UserHasPermission({ permission: Permissions.files.read })
  findAll(
    @ZodQuery(fileQuerySchema) query: FileQuery,
  ): Promise<FilesPaginatedResponse> {
    return this.filesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by id' })
  @ApiZodOkResponse(fileResponseSchema)
  @UserHasPermission({ permission: Permissions.files.read })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FileResponse> {
    return this.filesService.findById(id);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned upload URL' })
  @ApiZodCreatedResponse(presignedUrlResponseSchema)
  @UserHasPermission({ permission: Permissions.files.upload })
  getPresignedUrl(
    @ZodBody(presignedUrlRequestSchema) body: PresignedUrlRequest,
  ): Promise<PresignedUrlResponse> {
    return this.filesService.getPresignedUploadUrl(
      body.originalName,
      body.mimeType,
    );
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm upload and register file metadata' })
  @ApiZodCreatedResponse(fileResponseSchema)
  @UserHasPermission({ permission: Permissions.files.upload })
  confirmUpload(
    @CurrentUser() user: { id: string },
    @ZodBody(confirmUploadSchema) body: ConfirmUploadInput,
  ): Promise<FileResponse> {
    return this.filesService.confirmUpload(user.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  @ApiZodOkResponse(fileResponseSchema)
  @UserHasPermission({ permission: Permissions.files.delete })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<FileResponse | null> {
    return this.filesService.delete(id);
  }
}
