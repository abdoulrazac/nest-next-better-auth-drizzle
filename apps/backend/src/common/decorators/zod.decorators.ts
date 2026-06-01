// apps/backend/src/common/decorators/zod.decorators.ts
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { Body, Query } from '@nestjs/common';

// Reuse the same duck-typed schema interface from ZodValidationPipe
type AnyZodSchema = ConstructorParameters<typeof ZodValidationPipe>[0];

export const ZodBody = (schema: AnyZodSchema) =>
  Body(new ZodValidationPipe(schema));
export const ZodQuery = (schema: AnyZodSchema) =>
  Query(new ZodValidationPipe(schema));
