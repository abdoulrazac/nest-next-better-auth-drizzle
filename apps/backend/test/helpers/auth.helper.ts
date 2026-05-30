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
  const signUpRes = await app.inject({
    method: 'POST',
    url: '/api/auth/sign-up/email',
    payload: {
      email: credentials.email,
      password: credentials.password,
      name: credentials.name,
    },
  });

  const signUpCookies = signUpRes.headers['set-cookie'];
  if (signUpCookies) {
    return Array.isArray(signUpCookies)
      ? signUpCookies.join('; ')
      : signUpCookies;
  }

  const signInRes = await app.inject({
    method: 'POST',
    url: '/api/auth/sign-in/email',
    payload: { email: credentials.email, password: credentials.password },
  });

  const signInCookies = signInRes.headers['set-cookie'];
  if (!signInCookies) {
    throw new Error(
      `No session cookie received. Sign-up status: ${signUpRes.statusCode}, Sign-in status: ${signInRes.statusCode}`,
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
