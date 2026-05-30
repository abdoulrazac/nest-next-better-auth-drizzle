// .lintstagedrc.mjs
// ESLint is configured per-package (apps/*/eslint.config.mjs).
// lint-staged runs from the repo root where no root eslint config exists,
// so we delegate ESLint via turbo and only run prettier here.
export default {
  "*.{ts,tsx,js,mjs,cjs}": ["bunx prettier --write"],
  "*.{json,md,yml,yaml}": ["bunx prettier --write"],
};
