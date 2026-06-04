FROM oven/bun:1.3.14-alpine AS base
WORKDIR /app

# ── installer: copy manifests only for better layer caching ────────────────
FROM base AS installer
COPY package.json bun.lock turbo.json ./
COPY apps/backend/package.json  ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/web/package.json      ./apps/web/
COPY packages/db/package.json                ./packages/db/
COPY packages/emails/package.json            ./packages/emails/
COPY packages/validators/package.json        ./packages/validators/
COPY packages/api-client/package.json        ./packages/api-client/
COPY packages/eslint-config/package.json     ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json                ./packages/ui/
# --ignore-scripts avoids postinstall scripts running before source exists
# Note: --frozen-lockfile is omitted because bun.lock is generated on macOS
# and contains platform-specific entries that differ on Alpine Linux.
RUN bun install --ignore-scripts

# ── builder: compile all apps in one pass (turbo handles dep graph) ────────
FROM installer AS builder
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# INTERNAL_API_URL must also be baked at build time: Next.js evaluates
# rewrites() during `next build` and serialises the result into
# routes-manifest.json — it does NOT re-evaluate at container startup.
# In Docker Compose this is set to http://app:3000 (the backend service).
ARG INTERNAL_API_URL=http://localhost:3000
ENV INTERNAL_API_URL=$INTERNAL_API_URL
COPY . .
RUN bunx turbo run build

# ── runner-db-tools: migrate + seed ───────────────────────────────────────
# This stage intentionally does NOT depend on `builder` so that frontend/backend
# build failures don't block database migrations. It only needs the installed
# node_modules (from installer) and the db package source files.
FROM base AS runner-db-tools
WORKDIR /app/packages/db

# Root node_modules needed — bun hoists some deps (e.g. drizzle-orm) there
COPY --from=installer /app/node_modules                 /app/node_modules
COPY --from=installer /app/packages/db/node_modules     ./node_modules

# Copy db source files directly from build context (no compile step needed —
# bun runs TypeScript natively)
COPY packages/db/src                ./src
COPY packages/db/migrations         ./migrations
COPY packages/db/package.json       ./package.json
COPY packages/db/drizzle.config.ts  ./drizzle.config.ts
COPY packages/db/tsconfig.json      ./tsconfig.json

# ── runner-backend ─────────────────────────────────────────────────────────
FROM oven/bun:1.3.14-alpine AS runner-backend
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Run as a non-root user to reduce the blast radius of container escapes
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules                     ./node_modules
COPY --from=builder /app/apps/backend/node_modules        ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist                ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json        ./apps/backend/package.json
COPY --from=builder /app/packages/api-client/node_modules ./packages/api-client/node_modules
COPY --from=builder /app/packages/api-client/dist         ./packages/api-client/dist
COPY --from=builder /app/packages/api-client/package.json ./packages/api-client/package.json
COPY --from=builder /app/packages/db/node_modules         ./packages/db/node_modules
COPY --from=builder /app/packages/db/dist                 ./packages/db/dist
COPY --from=builder /app/packages/db/package.json         ./packages/db/package.json
COPY --from=builder /app/packages/emails/node_modules     ./packages/emails/node_modules
COPY --from=builder /app/packages/emails/dist             ./packages/emails/dist
COPY --from=builder /app/packages/emails/package.json     ./packages/emails/package.json
COPY --from=builder /app/packages/validators/node_modules ./packages/validators/node_modules
COPY --from=builder /app/packages/validators/dist         ./packages/validators/dist
COPY --from=builder /app/packages/validators/package.json ./packages/validators/package.json

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["bun", "run", "apps/backend/dist/main.js"]

# ── runner-frontend ────────────────────────────────────────────────────────
FROM oven/bun:1.3.14-alpine AS runner-frontend
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# standalone output contains trimmed node_modules + traced workspace packages
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static     ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public           ./apps/frontend/public

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["bun", "run", "apps/frontend/server.js"]

# ── runner-web ─────────────────────────────────────────────────────────────
FROM oven/bun:1.3.14-alpine AS runner-web
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder /app/apps/web/public           ./apps/web/public

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["bun", "run", "apps/web/server.js"]
