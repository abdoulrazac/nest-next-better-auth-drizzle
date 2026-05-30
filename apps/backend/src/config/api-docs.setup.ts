import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import scalarFastifyApiReference from '@scalar/fastify-api-reference';
import { auth } from '../auth/auth';

const SCALAR_CUSTOM_CSS = `
  /* Powered by Scalar */
  a[href="https://www.scalar.com"] { display: none !important; }
  /* Generate MCP */
  [data-v-d469cd5e] { display: none !important; }
  /* Ask AI */
  button.bg-sidebar-b-search:not([role="search"]) { display: none !important; }
`;

export interface MergeAuthOpenAPISchemaConfig {
  prefix?: string;
  pathPrefix?: string;
}

async function mergeAuthOpenAPISchema(
  document: OpenAPIObject,
  config: MergeAuthOpenAPISchemaConfig = {},
): Promise<OpenAPIObject> {
  const authSchema = await auth.api.generateOpenAPISchema();
  const { prefix, pathPrefix = '/api/auth' } = config;

  if (authSchema.paths) {
    const paths = Object.fromEntries(
      Object.entries(authSchema.paths).map(([path, item]) => [
        `${pathPrefix}${path}`,
        prefix
          ? Object.fromEntries(
              Object.entries(item as Record<string, any>).map(
                ([method, op]) => [
                  method,
                  op && Array.isArray((op as any).tags)
                    ? {
                        ...(op as any),
                        tags: (op as any).tags.map(
                          (t: string) => `${prefix}${t}`,
                        ),
                      }
                    : op,
                ],
              ),
            )
          : item,
      ]),
    );

    document.paths = { ...document.paths, ...paths };
  }

  if (authSchema.components?.schemas) {
    document.components ??= {};
    document.components.schemas = {
      ...(document.components.schemas ?? {}),
      ...authSchema.components.schemas,
    };
  }

  return document;
}

export async function buildOpenAPIDocument(
  app: NestFastifyApplication,
): Promise<OpenAPIObject> {
  const config = new DocumentBuilder()
    .setTitle('Enterprise API')
    .setDescription('Enterprise boilerplate API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const appDocument = SwaggerModule.createDocument(app, config);

  return mergeAuthOpenAPISchema(appDocument, auth, {
    prefix: 'auth - ',
    pathPrefix: '/api/auth',
  });
}

export async function setupApiDocs(
  app: NestFastifyApplication,
  document: OpenAPIObject,
): Promise<void> {
  const fastify = app.getHttpAdapter().getInstance();

  fastify.get('/api/docs-json', (_req: any, reply: any) => {
    reply.send(document);
  });

  await fastify.register(scalarFastifyApiReference, {
    routePrefix: '/api/docs',
    configuration: {
      url: '/api/docs-json',
      customCss: SCALAR_CUSTOM_CSS,
    },
  });
}
