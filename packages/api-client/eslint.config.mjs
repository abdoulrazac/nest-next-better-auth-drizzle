import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["src/generated/**"],
  },
  {
    // runtime.ts reads env vars from process.env — runs in Node (generate,
    // Next.js server) and React Native (Expo) runtimes.
    files: [
      "runtime.ts",
      "scripts/snapshot.mjs",
      "scripts/build-client-namespace.mjs",
    ],
    languageOptions: {
      globals: {
        process: "readonly",
        fetch: "readonly",
        console: "readonly",
      },
    },
  },
];
