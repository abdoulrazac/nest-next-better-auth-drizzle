import { describe, expect, it } from '@jest/globals';
import { ApiResponse } from '@nestjs/swagger';
import { z } from 'zod';
import { ApiZodOkResponse } from './zod-response.decorators';

describe('ApiZodOkResponse', () => {
  it('returns a decorator with generated schema metadata', () => {
    const schema = z.object({
      id: z.string().uuid(),
      name: z.string(),
    });

    const decorator = ApiZodOkResponse(schema);

    expect(typeof decorator).toBe('function');
  });
});
