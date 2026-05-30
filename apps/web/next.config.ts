import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The generated .source/ files from fumadocs-mdx trigger a TS 5.9
  // "cannot be named" error that @ts-nocheck cannot suppress.
  typescript: { ignoreBuildErrors: true },
};

export default withMDX(nextConfig);
