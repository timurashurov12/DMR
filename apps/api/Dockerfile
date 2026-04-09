# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root dependencies and monorepo config
COPY package.json package-lock.json ./

# Copy workspace apps
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Install dependencies
RUN npm ci

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build API
WORKDIR /app
RUN npm run build:api

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy root dependencies (only production)
COPY package.json package-lock.json ./

# Copy built API and Prisma artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Install production dependencies only
ENV NODE_ENV production
RUN npm ci --omit=dev && npm cache clean --force

# Expose API port
EXPOSE 3000

# Create uploads directory
RUN mkdir -p /app/uploads

# Set working directory for app execution
WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run migrations and start API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
