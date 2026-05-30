import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp, closeTestApp } from '../helpers/app.helper';

describe('HealthController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /health → 200 with status ok', async () => {
    const result = await app.inject({ method: 'GET', url: '/health' });
    expect(result.statusCode).toBe(200);
    expect(result.json()).toMatchObject({ status: 'ok' });
  });

  it('GET /health → public (no auth required)', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { cookie: '' },
    });
    expect(result.statusCode).toBe(200);
    expect(result.json().status).toBe('ok');
  });
});
