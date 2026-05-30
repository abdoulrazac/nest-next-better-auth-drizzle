import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Map the @fumadocs/server alias to the generated file at build time.
    // TypeScript uses an ambient declaration (src/types/fumadocs.d.ts) for types,
    // avoiding TS2742 "cannot be named" errors from the generated .source/ files.
    resolveAlias: {
      "@fumadocs/server": "./.source/server",
    },
  },
};

export default withMDX(nextConfig);
