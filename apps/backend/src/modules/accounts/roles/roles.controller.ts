// apps/backend/src/modules/accounts/roles/roles.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { RolesService } from './roles.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import {
  createRoleSchema,
  updateRoleSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
} from '@repo/validators/accounts';

@ApiTags('accounts/roles')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: 'accounts/roles', version: '1' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @UserHasPermission({ permission: { roles: ['read'] } })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  @UserHasPermission({ permission: { roles: ['read'] } })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  @UserHasPermission({ permission: { roles: ['write'] } })
  create(@Body(new ZodValidationPipe(createRoleSchema)) body: CreateRoleInput) {
    return this.rolesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @UserHasPermission({ permission: { roles: ['write'] } })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateRoleSchema)) body: UpdateRoleInput,
  ) {
    return this.rolesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @UserHasPermission({ permission: { roles: ['delete'] } })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.delete(id);
  }

  @Post(':id/assign/:userId')
  @ApiOperation({ summary: 'Assign role to user' })
  @UserHasPermission({ permission: { roles: ['write'] } })
  assignToUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.rolesService.assignToUser(userId, id);
  }
}
