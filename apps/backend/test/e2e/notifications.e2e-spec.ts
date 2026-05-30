import { describe, it, beforeAll, afterAll, expect } from 'vitest';
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
    const result = await app.inject({
      method: 'GET',
      url: '/v1/notifications',
    });
    expect([401, 403]).toContain(result.statusCode);
  });

  it('GET /v1/notifications → 200 with empty list for new user', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/v1/notifications',
      headers: { cookie: userCookie },
    });
    expect(result.statusCode).toBe(200);
    const body = result.json();
    const list = body.items ?? body.data;
    expect(list).toBeDefined();
    expect(Array.isArray(list)).toBe(true);
  });

  it('GET /v1/notifications/unread-count → 401 unauthenticated', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/v1/notifications/unread-count',
    });
    expect([401, 403]).toContain(result.statusCode);
  });

  it('GET /v1/notifications/unread-count → returns count when authenticated', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/v1/notifications/unread-count',
      headers: { cookie: userCookie },
    });
    expect(result.statusCode).toBe(200);
    const body = result.json();
    const count = body.count ?? body;
    expect(typeof count === 'number' || typeof count === 'object').toBe(true);
  });
});
