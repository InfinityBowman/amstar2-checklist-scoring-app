FROM node:24-alpine AS builder
WORKDIR /src
COPY package*.json ./
COPY packages/*/package.json ./packages/
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /src/dist ./dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]

FROM node:24-alpine AS development
WORKDIR /src
COPY . .
RUN npm ci
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]