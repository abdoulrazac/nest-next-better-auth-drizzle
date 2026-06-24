// apps/backend/src/common/decorators/zod.decorators.ts
import type { OpenApiZodAny } from '@anatine/zod-openapi';
import { generateSchema } from '@anatine/zod-openapi';
import { Body, Query } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';

import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';

// Reuse the same duck-typed schema interface from ZodValidationPipe
type AnyZodSchema = ConstructorParameters<typeof ZodValidationPipe>[0];

const toOpenApiSchema = (schema: AnyZodSchema) =>
  generateSchema(schema as OpenApiZodAny, false, '3.0') as Record<
    string,
    unknown
  >;

// `ZodBody`/`ZodQuery` are parameter decorators, but `@ApiBody`/`@ApiQuery` are
// method decorators that store metadata on the method function. Parameter
// decorators only receive (target, propertyKey, parameterIndex) — no descriptor
// — so we resolve the method and invoke the Swagger decorator with a synthetic
// descriptor. This makes the OpenAPI spec (and therefore @repo/api-client)
// fully typed for request bodies and query params, not just responses.
const applySwaggerMethodDecorator = (
  target: object,
  propertyKey: string | symbol,
  decorator: (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => unknown,
) => {
  const method = Object.getOwnPropertyDescriptor(target, propertyKey)?.value;
  if (typeof method !== 'function') {
    return;
  }
  decorator(target, propertyKey, {
    value: method,
    writable: true,
    enumerable: false,
    configurable: true,
  });
};

export const ZodBody = (schema: AnyZodSchema): ParameterDecorator => {
  const bodyParam = Body(new ZodValidationPipe(schema));
  const openApiSchema = toOpenApiSchema(schema);
  return (target, propertyKey, parameterIndex) => {
    bodyParam(target, propertyKey, parameterIndex);
    applySwaggerMethodDecorator(
      target,
      propertyKey!,
      ApiBody({ schema: openApiSchema }),
    );
  };
};

export const ZodQuery = (schema: AnyZodSchema): ParameterDecorator => {
  const queryParam = Query(new ZodValidationPipe(schema));
  const shape = (schema as { shape?: Record<string, AnyZodSchema> }).shape;
  return (target, propertyKey, parameterIndex) => {
    queryParam(target, propertyKey, parameterIndex);
    if (shape) {
      for (const [name, field] of Object.entries(shape)) {
        const isOptional = (
          field as { isOptional?: () => boolean } | undefined
        )?.isOptional?.();
        applySwaggerMethodDecorator(
          target,
          propertyKey!,
          ApiQuery({
            name,
            required: !isOptional,
            schema: toOpenApiSchema(field),
          }),
        );
      }
    } else {
      applySwaggerMethodDecorator(
        target,
        propertyKey!,
        ApiQuery({ schema: toOpenApiSchema(schema) }),
      );
    }
  };
};
