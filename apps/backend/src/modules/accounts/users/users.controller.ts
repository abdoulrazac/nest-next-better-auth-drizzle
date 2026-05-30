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
  UsePipes,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { UsersService } from './users.service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import {
  updateUserSchema,
  type UpdateUserInput,
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
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(Number(page), Number(limit), search);
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
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserInput,
  ) {
    return this.usersService.update(id, body);
  }

  @Post(':id/ban')
  @ApiOperation({ summary: 'Ban user' })
  @UserHasPermission({ permission: { users: ['delete'] } })
  ban(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
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
