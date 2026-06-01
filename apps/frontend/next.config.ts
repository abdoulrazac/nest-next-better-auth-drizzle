import path from "path";
import type { NextConfig } from "next";

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
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Type checking runs in CI; skip during Docker build to avoid OOM
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Allows Next.js to trace workspace packages (monorepo)
    outputFileTracingRoot: path.join(__dirname, "../../"),
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
