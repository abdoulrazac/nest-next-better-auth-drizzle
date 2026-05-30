import { describe, it, beforeAll, afterAll, expect } from 'vitest';
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
      const result = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: creds.email,
          password: creds.password,
          name: creds.name,
        },
      });
      expect([200, 201]).toContain(result.statusCode);
      expect(result.json()).toHaveProperty('user');
    });

    it('returns error on duplicate email', async () => {
      const creds = uniqueCredentials('dup');
      await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: creds.email,
          password: creds.password,
          name: creds.name,
        },
      });
      const result = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: creds.email,
          password: creds.password,
          name: creds.name,
        },
      });
      expect([400, 409, 422]).toContain(result.statusCode);
    });
  });

  describe('POST /api/auth/sign-in/email', () => {
    it('returns session cookie on valid credentials', async () => {
      const creds = uniqueCredentials('login');
      await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: creds.email,
          password: creds.password,
          name: creds.name,
        },
      });
      const result = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        payload: { email: creds.email, password: creds.password },
      });
      expect([200, 201]).toContain(result.statusCode);
      expect(result.headers['set-cookie']).toBeDefined();
    });

    it('returns error on wrong password', async () => {
      const creds = uniqueCredentials('badpw');
      await app.inject({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        payload: {
          email: creds.email,
          password: creds.password,
          name: creds.name,
        },
      });
      const result = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        payload: { email: creds.email, password: 'WrongPassword999!' },
      });
      expect([400, 401, 403]).toContain(result.statusCode);
    });
  });
});
