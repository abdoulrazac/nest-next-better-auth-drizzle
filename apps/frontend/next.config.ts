import type { NextConfig } from "next";
import path from "path";

// INTERNAL_API_URL is for server-side rewrites (e.g. http://app:3000 in Docker).
// NEXT_PUBLIC_API_URL is the public URL baked into the browser bundle.
// In local dev without Docker both fall back to http://localhost:3000.
const apiUrl =
  process.env["INTERNAL_API_URL"] ??
  process.env["NEXT_PUBLIC_API_URL"] ??
  "http://localhost:3000";

const securityHeaders = [
  // Block rendering in <iframe> / <frame> / <object> — prevents clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing the Content-Type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer info to origin-only on cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict powerful browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Enable DNS prefetching for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Broad CSP for a Next.js dashboard (unsafe-inline required without nonces;
  // tighten by migrating to nonce-based CSP if stricter protection is needed)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      // Allow both http/https and ws/wss so the app works in every environment:
      // - dev:  backend on http://localhost:3000, WebSocket on ws://localhost:*
      // - prod: everything is HTTPS/WSS (http: and ws: are no-ops in practice
      //   because the browser upgrade-insecure-requests and the server only
      //   accepts HTTPS — keep them to avoid breaking staging/preview envs)
      "connect-src 'self' http: https: ws: wss:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Allows Next.js to trace workspace packages (monorepo)
  outputFileTracingRoot: path.join(__dirname, "../../"),
  typescript: {
    // Type checking runs in CI; skip during Docker build to avoid OOM
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Proxy auth requests through Next.js so the browser always calls 'self'.
    // This avoids CSP connect-src issues in every environment.
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Prevent caching of authenticated API responses
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
