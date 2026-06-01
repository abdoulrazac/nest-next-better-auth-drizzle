// apps/backend/src/main.ts
import helmet from '@fastify/helmet';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import 'dotenv/config';
import IORedis from 'ioredis';
import { AppModule } from './app.module';
import { buildOpenAPIDocument, setupApiDocs } from './config/api-docs.setup';
import { env } from './config/env';
import { RedisIoAdapter } from './websocket/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: env.NODE_ENV === 'development' }),
  );

  // ── Security headers ──────────────────────────────────────────────────────
  // CSP is intentionally relaxed for the Scalar API docs UI (loads external
  // scripts). Tighten scriptSrc / styleSrc once the docs route is removed in
  // production or moved behind authentication.
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'ws:'],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts:
      env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    // crossOriginEmbedderPolicy breaks Scalar docs — disable outside prod
    crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
  });

  // ── Cache-Control: no-store on all API responses ──────────────────────────
  // Prevents sensitive data from being stored in browser / proxy caches.
  // Individual routes may override this header if caching is intentional.
  app
    .getHttpAdapter()
    .getInstance()

    .addHook(
      'onSend',
      (_request: any, reply: any, _payload: any, done: () => void) => {
        const existing: string | number | string[] | undefined =
          reply.getHeader('cache-control') as
            | string
            | number
            | string[]
            | undefined;
        if (!existing) {
          reply.header('cache-control', 'no-store, max-age=0, private');
        }
        done();
      },
    );

  // Redis adapter for Socket.IO
  const redisIoAdapter = new RedisIoAdapter(app);
  const redisClient = new IORedis(env.REDIS_URL);
  redisIoAdapter.connectToRedis(redisClient);
  app.useWebSocketAdapter(redisIoAdapter);

  app.setGlobalPrefix('api', {
    exclude: ['api/docs', 'api/docs-json', 'api/auth'],
  });
  app.enableVersioning({ type: VersioningType.URI });
  app.enableCors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  });

  const document = await buildOpenAPIDocument(app);
  await setupApiDocs(app, document);

  await app.listen(env.PORT, '0.0.0.0');
  console.log(`Application running on: http://localhost:${env.PORT}`);
  console.log(`Scalar docs: http://localhost:${env.PORT}/api/docs`);
}

void bootstrap();
