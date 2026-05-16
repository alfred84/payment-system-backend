# syntax=docker/dockerfile:1

# --- Build stage (native deps for bcrypt) ---
FROM node:24-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

COPY node-api/package.json node-api/package-lock.json* ./node-api/
COPY node-api/prisma ./node-api/prisma/
WORKDIR /app/node-api

RUN npm ci 2>/dev/null || npm install
COPY node-api/tsconfig.json node-api/tsconfig.build.json ./
COPY node-api/src ./src/

RUN npx prisma generate
RUN npm run build

# --- Production stage ---
FROM node:24-alpine AS production

WORKDIR /app/node-api

RUN apk add --no-cache openssl

COPY --from=builder /app/node-api/package.json /app/node-api/package-lock.json* ./
COPY --from=builder /app/node-api/node_modules ./node_modules
COPY --from=builder /app/node-api/dist ./dist
COPY --from=builder /app/node-api/prisma ./prisma

COPY docker/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
