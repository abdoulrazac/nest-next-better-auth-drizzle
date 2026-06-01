// apps/backend/src/modules/accounts/users/users.controller.ts
import { Permissions } from '@/auth/permission';
import { ApiZodOkResponse } from '@/common/decorators/zod-response.decorators';
import { ZodBody, ZodQuery } from '@/common/decorators/zod.decorators';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  banUserSchema,
  paginationQuerySchema,
  updateUserSchema,
  userResponseSchema,
  usersPaginatedResponseSchema,
  type BanUserInput,
  type PaginationQuery,
  type UpdateUserInput,
  type UserResponse,
  type UsersPaginatedResponse,
} from '@repo/validators/accounts';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { UsersService } from './users.service';

@ApiTags('accounts/users')
@ApiBearerAuth()
@Controller({ path: 'accounts/users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiZodOkResponse(usersPaginatedResponseSchema)
  @UserHasPermission({ permission: Permissions.users.read })
  findAll(
    @ZodQuery(paginationQuerySchema) query: PaginationQuery,
  ): Promise<UsersPaginatedResponse> {
    return this.usersService.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiZodOkResponse(userResponseSchema)
  @UserHasPermission({ permission: Permissions.users.read })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiZodOkResponse(userResponseSchema)
  @UserHasPermission({ permission: Permissions.users.write })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(updateUserSchema) body: UpdateUserInput,
  ): Promise<UserResponse | null> {
    return this.usersService.update(id, body);
  }

  @Post(':id/ban')
  @ApiOperation({ summary: 'Ban user' })
  @ApiZodOkResponse(userResponseSchema)
  @UserHasPermission({ permission: Permissions.users.delete })
  ban(
    @Param('id', ParseUUIDPipe) id: string,
    @ZodBody(banUserSchema) body: BanUserInput,
  ): Promise<UserResponse | null> {
    return this.usersService.ban(id, body.reason);
  }

  @Post(':id/unban')
  @ApiOperation({ summary: 'Unban user' })
  @ApiZodOkResponse(userResponseSchema)
  @UserHasPermission({ permission: Permissions.users.delete })
  unban(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse | null> {
    return this.usersService.unban(id);
  }
}
