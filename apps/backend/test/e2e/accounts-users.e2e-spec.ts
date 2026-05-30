import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp, closeTestApp } from '../helpers/app.helper';
import { signUpAndLogin, uniqueCredentials } from '../helpers/auth.helper';

describe('AccountsModule — UsersController (e2e)', () => {
  let app: NestFastifyApplication;
  let userCookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    userCookie = await signUpAndLogin(app, uniqueCredentials('acct-user'));
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /v1/accounts/users → 401 when unauthenticated', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/v1/accounts/users',
    });
    expect([401, 403]).toContain(result.statusCode);
  });

  it('GET /v1/accounts/users → 200 with paginated data when authenticated', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/v1/accounts/users',
      headers: { cookie: userCookie },
    });
    expect(result.statusCode).toBe(200);
    const body = result.json();
    const list = body.items ?? body.data;
    expect(list).toBeDefined();
    expect(Array.isArray(list)).toBe(true);
  });

  it('GET /v1/accounts/users/:id → 404 for non-existent user', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/v1/accounts/users/00000000-0000-0000-0000-000000000000',
      headers: { cookie: userCookie },
    });
    expect([400, 404]).toContain(result.statusCode);
  });
});
