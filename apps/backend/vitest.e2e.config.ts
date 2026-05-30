import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // @ts-ignore - vitest 4 native tsconfig paths support
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/e2e/**/*.e2e-spec.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    singleFork: true,
    setupFiles: ['test/helpers/setup.ts'],
  },
});
