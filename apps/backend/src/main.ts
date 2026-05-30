// apps/backend/src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: env.NODE_ENV === 'development' }),
  );

  // API versioning
  app.enableVersioning({ type: VersioningType.URI });

  // CORS
  app.enableCors({
    origin: env.BETTER_AUTH_URL,
    credentials: true,
  });

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Enterprise API')
    .setDescription('Enterprise boilerplate API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(env.PORT, '0.0.0.0');
  console.log(`Application running on: http://localhost:${env.PORT}`);
  console.log(`Swagger docs: http://localhost:${env.PORT}/api/docs`);
}

void bootstrap();
