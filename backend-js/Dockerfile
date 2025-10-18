# Bun/Elysia Backend Dockerfile

FROM oven/bun:latest AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# --- Production stage ---
FROM base AS production
ENV NODE_ENV=production
EXPOSE 3004
CMD ["bun", "run", "start"]

# --- Development stage ---
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3004
CMD ["bun", "run", "dev"]