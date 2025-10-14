FROM node:24-alpine AS builder

WORKDIR /src

COPY package*.json ./
COPY packages/*/package.json ./packages/

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5173

# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]