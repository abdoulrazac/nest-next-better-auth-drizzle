// apps/backend/src/common/pipes/zod-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

type SafeParseSuccess = { success: true; data: unknown };
type SafeParseFailure = {
  success: false;
  error: { issues: Array<{ path: PropertyKey[]; message: string }> };
};
type AnyZodSchema = {
  safeParse(value: unknown): SafeParseSuccess | SafeParseFailure;
};

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: AnyZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
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
