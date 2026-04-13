# ─────────────────────────────────────────────
# Asgard — Server Dockerfile
# Runtime: Bun
# ─────────────────────────────────────────────

FROM oven/bun:1 AS base
WORKDIR /app

# ── Install dependencies ──────────────────────
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Generate Prisma client ────────────────────
FROM deps AS prisma-gen
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN bunx prisma generate

# ── Final image ───────────────────────────────
FROM base AS runner
WORKDIR /app

# Copy installed node_modules and generated Prisma client
COPY --from=prisma-gen /app/node_modules ./node_modules
COPY --from=prisma-gen /app/generated ./generated

# Copy application source
COPY . .

EXPOSE 3000

CMD ["bun", "--watch", "index.ts"]
