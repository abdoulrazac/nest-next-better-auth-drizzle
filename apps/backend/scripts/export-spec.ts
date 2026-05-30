// apps/backend/scripts/export-spec.ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../src/app.module';

async function exportSpec() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: false },
  );

  app.enableVersioning({ type: VersioningType.URI });

  const config = new DocumentBuilder()
    .setTitle('Enterprise API')
    .setDescription('Enterprise boilerplate API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputPath = resolve(
    __dirname,
    '../../../packages/api-client/openapi.json',
  );
  writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');
  console.log(`OpenAPI spec written to ${outputPath}`);

  await app.close();
  process.exit(0);
}

exportSpec().catch((err) => {
  console.error(err);
  process.exit(1);
});
