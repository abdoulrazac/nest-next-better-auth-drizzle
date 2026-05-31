// apps/backend/src/modules/accounts/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { UsersService } from './users.service';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '@/common/interceptors/audit-log.interceptor';
import {
  paginationQuerySchema,
  updateUserSchema,
  banUserSchema,
  type PaginationQuery,
  type UpdateUserInput,
  type BanUserInput,
} from '@repo/validators/accounts';

@ApiTags('accounts/users')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: 'accounts/users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @UserHasPermission({ permission: { users: ['read'] } })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    return this.usersService.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @UserHasPermission({ permission: { users: ['read'] } })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @UserHasPermission({ permission: { users: ['write'] } })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserInput,
  ) {
    return this.usersService.update(id, body);
  }

  @Post(':id/ban')
  @ApiOperation({ summary: 'Ban user' })
  @UserHasPermission({ permission: { users: ['delete'] } })
  ban(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(banUserSchema)) body: BanUserInput,
  ) {
    return this.usersService.ban(id, body.reason);
  }

  @Post(':id/unban')
  @ApiOperation({ summary: 'Unban user' })
  @UserHasPermission({ permission: { users: ['delete'] } })
  unban(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.unban(id);
  }
}
