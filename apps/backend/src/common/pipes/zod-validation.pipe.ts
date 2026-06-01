// apps/backend/src/common/pipes/zod-validation.pipe.ts
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

type SafeParseSuccess = { success: true; data: unknown };
type SafeParseFailure = {
  success: false;
  error: { issues: Array<{ path: PropertyKey[]; message: string }> };
};
// Duck-typed to avoid importing zod directly in the pipe
type AnyZodSchema = {
  safeParse(value: any): SafeParseSuccess | SafeParseFailure;
};

@Injectable()
export class ZodValidationPipe implements PipeTransform<any, any> {
  constructor(private readonly schema: AnyZodSchema) {}

  // ArgumentMetadata is required by the interface but not used here
  transform(value: any, _metadata: ArgumentMetadata): any {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = this.formatErrors(result.error);
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    return result.data;
  }

  private formatErrors(error: {
    issues: Array<{ path: PropertyKey[]; message: string }>;
  }) {
    return error.issues.map((err) => ({
      field: err.path
        .filter((p): p is string | number => typeof p !== 'symbol')
        .join('.'),
      message: err.message,
    }));
  }
}
