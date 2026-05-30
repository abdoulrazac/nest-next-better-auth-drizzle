import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import supertest from 'supertest';
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
    const res = await supertest(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('GET /health → public (no auth required)', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/health')
      .set('cookie', '')
      .expect(200);
    expect(res.body.status).toBe('ok');
  });
});
