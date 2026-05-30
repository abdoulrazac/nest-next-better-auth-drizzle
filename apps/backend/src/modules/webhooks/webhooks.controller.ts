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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import {
  createWebhookSchema,
  updateWebhookSchema,
  type CreateWebhookInput,
  type UpdateWebhookInput,
} from '@repo/validators/webhooks';

@ApiTags('webhooks')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: 'webhooks', version: '1' })
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhooks' })
  @UserHasPermission({ permission: { webhooks: ['read'] } })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.webhooksService.findAll(Number(page), Number(limit));
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
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.webhooksService.getDeliveries(id, Number(page), Number(limit));
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
