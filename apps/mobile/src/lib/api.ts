// apps/mobile/src/lib/api.ts
// Single entry point for all API calls on mobile. Components and hooks should
// import from here, not directly from @repo/api-client.
import { client, apiClient } from '@repo/api-client';

import { authClient } from './auth-client';

// Unlike the web app (same-origin, browser sends the session cookie
// automatically), React Native runs cross-origin to the backend and does NOT
// send cookies. The Better Auth expo plugin stores the session cookie in
// SecureStore and exposes it via `authClient.getCookie()`. We inject it on
// every outgoing request through a custom fetch wrapper so the NestJS backend
// (Better Auth middleware) authenticates the call.
const apiFetch: typeof fetch = async (input, init) => {
  const cookie = authClient.getCookie();
  if (!cookie) return fetch(input, init);
  const headers = new Headers(init?.headers);
  headers.set('cookie', cookie);
  return fetch(input, { ...init, headers });
};

// Configure the raw hey-api client (shared by apiClient's methods).
client.setConfig({ fetch: apiFetch });

export { apiClient, client };
export * from '@repo/api-client';

// Example usage — unauthenticated health probe (GET /health, VERSION_NEUTRAL).
export async function getHealth() {
  const { data, error } = await apiClient.v1.healthCheck();
  if (error) throw error;
  return data;
}
