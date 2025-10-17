# Bun/Elysia Backend Dockerfile
FROM oven/bun:latest AS base

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the app port (default 3004)
EXPOSE 3004

# Set environment variables (override in docker-compose or at runtime)
ENV NODE_ENV=production

# Start the server
CMD ["bun", "run", "dev"]
