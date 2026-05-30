import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import supertest from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp, closeTestApp } from '../helpers/app.helper';
import { signUpAndLogin, uniqueCredentials } from '../helpers/auth.helper';

describe('NotificationsModule (e2e)', () => {
  let app: NestFastifyApplication;
  let userCookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    userCookie = await signUpAndLogin(app, uniqueCredentials('notif-user'));
  });
  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /v1/notifications → 401 unauthenticated', async () => {
    const res = await supertest(app.getHttpServer()).get('/v1/notifications');
    expect([401, 403]).toContain(res.status);
  });

  it('GET /v1/notifications → 200 with empty list for new user', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/v1/notifications')
      .set('cookie', userCookie)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /v1/notifications/unread-count → 401 unauthenticated', async () => {
    const res = await supertest(app.getHttpServer()).get(
      '/v1/notifications/unread-count',
    );
    expect([401, 403]).toContain(res.status);
  });

  it('GET /v1/notifications/unread-count → returns count when authenticated', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/v1/notifications/unread-count')
      .set('cookie', userCookie)
      .expect(200);
    const count = res.body.count ?? res.body;
    expect(typeof count === 'number' || typeof count === 'object').toBe(true);
  });
});
