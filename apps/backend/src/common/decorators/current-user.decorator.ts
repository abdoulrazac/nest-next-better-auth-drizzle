// apps/backend/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

/**
 * Returns the current authenticated user from the request.
 *
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: SessionUser) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: unknown }>();
    return request.user;
  },
);
