// apps/backend/src/common/interceptors/audit-log.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { db } from '@repo/db';
import { auditLog } from '@repo/db/schema';

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async () => {
        if (!user?.id) return;

        // Extract resource and resourceId from URL
        // e.g. /api/v1/accounts/users/123 → resource: "users", resourceId: "123"
        const segments = (url as string).split('/').filter(Boolean);
        const resource =
          segments[segments.length - 2] ??
          segments[segments.length - 1] ??
          'unknown';
        const resourceId = segments[segments.length - 1];
        const isUuid = /^[0-9a-f-]{36}$/.test(resourceId ?? '');

        await db.insert(auditLog).values({
          userId: user.id as string,
          action: (method as string).toLowerCase(),
          resource,
          resourceId: isUuid ? resourceId : null,
          metadata: { url, duration: Date.now() - startTime },
          ipAddress:
            (ip as string | undefined) ??
            (headers['x-forwarded-for'] as string | undefined),
          userAgent: headers['user-agent'] as string | undefined,
        });
      }),
    );
  }
}
