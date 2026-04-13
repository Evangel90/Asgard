# ─────────────────────────────────────────────
# Asgard — Client Dockerfile
# Runtime: Bun + Vite dev server
# ─────────────────────────────────────────────

FROM oven/bun:1 AS base
WORKDIR /app

# ── Install dependencies ──────────────────────
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Development server ────────────────────────
FROM base AS runner
WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

EXPOSE 5173

# Bind to 0.0.0.0 so the port is reachable outside the container
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0"]
