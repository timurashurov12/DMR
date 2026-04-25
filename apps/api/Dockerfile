# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api ./apps/api
COPY apps/web ./apps/web

RUN npm ci

WORKDIR /app/apps/api
RUN npx prisma generate

WORKDIR /app
RUN npm run build:api

# Prune dev dependencies so the runtime image stays lean
RUN npm prune --omit=dev

# Runtime stage
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3000

RUN mkdir -p /app/uploads

WORKDIR /app/apps/api

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
