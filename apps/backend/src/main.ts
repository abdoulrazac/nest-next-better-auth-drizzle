// apps/backend/src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { env } from './config/env';
import { buildOpenAPIDocument, setupApiDocs } from './config/api-docs.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: env.NODE_ENV === 'development' }),
  );

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
