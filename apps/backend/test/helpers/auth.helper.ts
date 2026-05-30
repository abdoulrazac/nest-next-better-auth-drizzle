import supertest from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export interface TestCredentials {
  email: string;
  password: string;
  name: string;
}

export async function signUpAndLogin(
  app: NestFastifyApplication,
  credentials: TestCredentials,
): Promise<string> {
  const server = app.getHttpServer();

  const signUpRes = await supertest(server)
    .post('/api/auth/sign-up/email')
    .send({
      email: credentials.email,
      password: credentials.password,
      name: credentials.name,
    });

  const signUpCookies: string[] = signUpRes.headers['set-cookie'] ?? [];
  if (signUpCookies.length > 0) {
    return Array.isArray(signUpCookies)
      ? signUpCookies.join('; ')
      : signUpCookies;
  }

  const signInRes = await supertest(server)
    .post('/api/auth/sign-in/email')
    .send({ email: credentials.email, password: credentials.password });

  const signInCookies: string[] = signInRes.headers['set-cookie'] ?? [];
  if (signInCookies.length === 0) {
    throw new Error(
      `No session cookie received. Sign-up status: ${signUpRes.status}, Sign-in status: ${signInRes.status}`,
    );
  }

  return Array.isArray(signInCookies)
    ? signInCookies.join('; ')
    : signInCookies;
}

export function uniqueCredentials(prefix = 'user'): TestCredentials {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return {
    email: `${prefix}-${id}@test.example`,
    password: 'TestPassword123!',
    name: `Test ${prefix} ${id}`,
  };
}
