// apps/backend/src/common/pipes/zod-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodSchema = { safeParse(value: unknown): any };

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: AnyZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
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
    issues: Array<{ path: (string | number)[]; message: string }>;
  }) {
    return error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
}
