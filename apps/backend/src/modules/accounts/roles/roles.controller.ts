// apps/backend/src/modules/accounts/roles/roles.controller.ts
import { Permissions } from '@/auth/permission';
import {
  ApiZodCreatedResponse,
  ApiZodOkResponse,
} from '@/common/decorators/zod-response.decorators';
import { ZodBody } from '@/common/decorators/zod.decorators';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createRoleSchema,
  permissionsResponseSchema,
  roleResponseSchema,
  updateRoleSchema,
  userRoleResponseSchema,
  type CreateRoleInput,
  type PermissionsResponse,
  type RoleResponse,
  type UpdateRoleInput,
  type UserRoleResponse,
} from '@repo/validators/accounts';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { RolesService } from './roles.service';

@ApiTags('accounts/roles')
@ApiBearerAuth()
@Controller({ path: 'accounts/roles', version: '1' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @ApiZodOkResponse(roleResponseSchema, { isArray: true })
  @UserHasPermission({ permission: Permissions.roles.read })
  findAll(): Promise<RoleResponse[]> {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get available permissions (resource → actions)' })
  @ApiZodOkResponse(permissionsResponseSchema)
  @UserHasPermission({ permission: Permissions.roles.read })
  getPermissions(): PermissionsResponse {
    return this.rolesService.getPermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  @ApiZodOkResponse(roleResponseSchema)
  @UserHasPermission({ permission: Permissions.roles.read })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RoleResponse> {
    return this.rolesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  @ApiZodCreatedResponse(roleResponseSchema)
  @UserHasPermission({ permission: Permissions.roles.write })
  create(
    @ZodBody(createRoleSchema) body: CreateRoleInput,
  ): Promise<RoleResponse> {
    return this.rolesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiZodOkResponse(roleResponseSchema)
  @UserHasPermission({ permission: Permissions.roles.write })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(updateRoleSchema) body: UpdateRoleInput,
  ): Promise<RoleResponse | null> {
    return this.rolesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiZodOkResponse(roleResponseSchema)
  @UserHasPermission({ permission: Permissions.roles.delete })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<RoleResponse | null> {
    return this.rolesService.delete(id);
  }

  @Post(':id/assign/:userId')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiZodCreatedResponse(userRoleResponseSchema)
  @UserHasPermission({ permission: Permissions.roles.write })
  assignToUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserRoleResponse> {
    return this.rolesService.assignToUser(userId, id);
  }
}
