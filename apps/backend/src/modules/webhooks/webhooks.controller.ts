// apps/backend/src/modules/webhooks/webhooks.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { Permissions } from '@/auth/permission';
import { ZodBody, ZodQuery } from '@/common/decorators/zod.decorators';
import { WebhooksService } from './webhooks.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  ApiZodCreatedResponse,
  ApiZodOkResponse,
} from '@/common/decorators/zod-response.decorators';
import {
  createWebhookSchema,
  updateWebhookSchema,
  webhookDeliveriesPaginatedResponseSchema,
  webhookResponseSchema,
  webhooksPaginatedResponseSchema,
  type CreateWebhookInput,
  type UpdateWebhookInput,
  type WebhookDeliveriesPaginatedResponse,
  type WebhookResponse,
  type WebhooksPaginatedResponse,
} from '@repo/validators/webhooks';
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '@repo/validators/accounts';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller({ path: 'webhooks', version: '1' })
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhooks' })
  @ApiZodOkResponse(webhooksPaginatedResponseSchema)
  @UserHasPermission({ permission: Permissions.webhooks.read })
  findAll(
    @ZodQuery(paginationQuerySchema) query: PaginationQuery,
  ): Promise<WebhooksPaginatedResponse> {
    return this.webhooksService.findAll(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by id' })
  @ApiZodOkResponse(webhookResponseSchema)
  @UserHasPermission({ permission: Permissions.webhooks.read })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WebhookResponse> {
    return this.webhooksService.findById(id);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get webhook delivery history' })
  @ApiZodOkResponse(webhookDeliveriesPaginatedResponseSchema)
  @UserHasPermission({ permission: Permissions.webhooks.read })
  getDeliveries(
    @Param('id', ParseUUIDPipe) id: string,
    @ZodQuery(paginationQuerySchema) query: PaginationQuery,
  ): Promise<WebhookDeliveriesPaginatedResponse> {
    return this.webhooksService.getDeliveries(id, query.page, query.limit);
  }

  @Post()
  @ApiOperation({ summary: 'Create webhook' })
  @ApiZodCreatedResponse(webhookResponseSchema)
  @UserHasPermission({ permission: Permissions.webhooks.write })
  create(
    @CurrentUser() user: { id: string },
    @ZodBody(createWebhookSchema) body: CreateWebhookInput,
  ): Promise<WebhookResponse> {
    return this.webhooksService.create(body, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update webhook' })
  @ApiZodOkResponse(webhookResponseSchema)
  @UserHasPermission({ permission: Permissions.webhooks.write })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(updateWebhookSchema) body: UpdateWebhookInput,
  ): Promise<WebhookResponse | null> {
    return this.webhooksService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete webhook' })
  @ApiZodOkResponse(webhookResponseSchema)
  @UserHasPermission({ permission: Permissions.webhooks.delete })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebhookResponse | null> {
    return this.webhooksService.delete(id);
  }
}
