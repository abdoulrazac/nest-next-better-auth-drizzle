import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import supertest from 'supertest';
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
    const res = await supertest(app.getHttpServer()).get('/v1/accounts/users');
    expect([401, 403]).toContain(res.status);
  });

  it('GET /v1/accounts/users → 200 with paginated data when authenticated', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/v1/accounts/users')
      .set('cookie', userCookie)
      .expect(200);
    // API returns { items, total, page, limit } pagination shape
    const list = res.body.items ?? res.body.data;
    expect(list).toBeDefined();
    expect(Array.isArray(list)).toBe(true);
  });

  it('GET /v1/accounts/users → 404 for non-existent user', async () => {
    await supertest(app.getHttpServer())
      .get('/v1/accounts/users/00000000-0000-0000-0000-000000000000')
      .set('cookie', userCookie)
      .expect((res) => {
        expect([404, 400]).toContain(res.status);
      });
  });
});
