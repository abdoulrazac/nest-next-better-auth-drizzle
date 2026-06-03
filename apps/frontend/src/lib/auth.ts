// apps/frontend/src/lib/auth.ts
//
// Server-side auth proxy for Next.js server components.
// Used exclusively with `ensureSession` / `prefetchSession` from
// `@better-auth-ui/react/server` — it calls `auth.api.getSession` which
// forwards the request headers (cookies) to the NestJS backend.
//
// The full Better Auth config lives in apps/backend/src/auth/auth.ts.
// We intentionally avoid importing it here to keep the frontend free of
// database dependencies.

import type { AuthServer } from "@better-auth-ui/react/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const auth = {
  api: {
    getSession: async ({ headers }: { headers: Headers }) => {
      const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
        headers,
      });
      if (!res.ok) return null;
      return res.json();
    },
  },
} as unknown as AuthServer;
