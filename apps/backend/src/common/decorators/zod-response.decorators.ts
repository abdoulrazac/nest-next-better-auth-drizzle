import type { OpenApiZodAny } from '@anatine/zod-openapi';
import { generateSchema } from '@anatine/zod-openapi';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

interface ApiZodResponseOptions {
  description?: string;
  isArray?: boolean;
}

const toOpenApiSchema = (schema: unknown, isArray = false) => {
  const baseSchema = generateSchema(
    schema as OpenApiZodAny,
    false,
    '3.0',
  ) as Record<string, unknown>;

  if (isArray) {
    return {
      type: 'array' as const,
      items: baseSchema,
    };
  }

  return baseSchema;
};

export const ApiZodOkResponse = (
  schema: unknown,
  options: ApiZodResponseOptions = {},
) =>
  ApiOkResponse({
    description: options.description,
    schema: toOpenApiSchema(schema, options.isArray),
  });

export const ApiZodCreatedResponse = (
  schema: unknown,
  options: ApiZodResponseOptions = {},
) =>
  ApiCreatedResponse({
    description: options.description,
    schema: toOpenApiSchema(schema, options.isArray),
  });
