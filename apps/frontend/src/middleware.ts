// apps/frontend/src/middleware.ts
// Proxy/middleware entry point required by Next.js so the session-cookie
// aware redirects defined in `proxy.ts` actually run on every matched route.
export { proxy as middleware, config } from "./proxy";
