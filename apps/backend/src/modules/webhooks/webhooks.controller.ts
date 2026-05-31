// apps/backend/src/modules/webhooks/webhooks.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { WebhooksService } from './webhooks.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '@/common/interceptors/audit-log.interceptor';
import {
  createWebhookSchema,
  updateWebhookSchema,
  type CreateWebhookInput,
  type UpdateWebhookInput,
} from '@repo/validators/webhooks';
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '@repo/validators/accounts';

@ApiTags('webhooks')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: 'webhooks', version: '1' })
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhooks' })
  @UserHasPermission({ permission: { webhooks: ['read'] } })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    return this.webhooksService.findAll(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by id' })
  @UserHasPermission({ permission: { webhooks: ['read'] } })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.webhooksService.findById(id);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get webhook delivery history' })
  @UserHasPermission({ permission: { webhooks: ['read'] } })
  getDeliveries(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    return this.webhooksService.getDeliveries(id, query.page, query.limit);
  }

  @Post()
  @ApiOperation({ summary: 'Create webhook' })
  @UserHasPermission({ permission: { webhooks: ['write'] } })
  create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(createWebhookSchema)) body: CreateWebhookInput,
  ) {
    return this.webhooksService.create(body, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update webhook' })
  @UserHasPermission({ permission: { webhooks: ['write'] } })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateWebhookSchema)) body: UpdateWebhookInput,
  ) {
    return this.webhooksService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete webhook' })
  @UserHasPermission({ permission: { webhooks: ['delete'] } })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.webhooksService.delete(id);
  }
}
