import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import supertest from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp, closeTestApp } from '../helpers/app.helper';
import { uniqueCredentials } from '../helpers/auth.helper';

describe('Auth (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/auth/sign-up/email', () => {
    it('registers a new user and returns 200', async () => {
      const creds = uniqueCredentials('signup');
      const res = await supertest(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        });
      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('user');
    });

    it('returns error on duplicate email', async () => {
      const creds = uniqueCredentials('dup');
      await supertest(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        });
      const res = await supertest(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        });
      expect([400, 409, 422]).toContain(res.status);
    });
  });

  describe('POST /api/auth/sign-in/email', () => {
    it('returns session cookie on valid credentials', async () => {
      const creds = uniqueCredentials('login');
      await supertest(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        });
      const res = await supertest(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({ email: creds.email, password: creds.password });
      expect([200, 201]).toContain(res.status);
      const cookies: string[] = res.headers['set-cookie'] ?? [];
      expect(cookies.length).toBeGreaterThan(0);
    });

    it('returns error on wrong password', async () => {
      const creds = uniqueCredentials('badpw');
      await supertest(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          email: creds.email,
          password: creds.password,
          name: creds.name,
        });
      const res = await supertest(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({ email: creds.email, password: 'WrongPassword999!' });
      expect([400, 401, 403]).toContain(res.status);
    });
  });
});
