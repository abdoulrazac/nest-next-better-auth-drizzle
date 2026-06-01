// apps/backend/src/common/interceptors/audit-log.interceptor.ts
import { AuditLogsService } from '@/modules/accounts/audit-logs/audit-logs.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Observable, tap } from 'rxjs';

interface AuthenticatedRequest extends FastifyRequest {
  user?: { id: string };
}

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, url, user, ip, headers } = request;

    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      tap(async () => {
        if (!user?.id) return;

        const segments = url.split('/').filter(Boolean);
        const resource =
          segments[segments.length - 2] ??
          segments[segments.length - 1] ??
          'unknown';
        const resourceId = segments[segments.length - 1];
        const isUuid = /^[0-9a-f-]{36}$/.test(resourceId ?? '');

        await this.auditLogService.create({
          userId: user.id,
          action: method.toLowerCase(),
          resource,
          resourceId: isUuid ? resourceId : null,
          metadata: { url, duration: Date.now() - startTime },
          ipAddress: ip ?? (headers['x-forwarded-for'] as string | undefined),
          userAgent: headers['user-agent'],
        });
      }),
    );
  }
}
