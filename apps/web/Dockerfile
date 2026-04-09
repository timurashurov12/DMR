# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root dependencies and monorepo config
COPY package.json package-lock.json ./

# Copy workspace apps
COPY apps/web ./apps/web
COPY apps/api ./apps/api

# Install dependencies
RUN npm ci

# Build web app with environment variables
ARG VITE_API_URL=http://localhost:3000
ARG VITE_TELEGRAM_BOT_USERNAME=

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TELEGRAM_BOT_USERNAME=$VITE_TELEGRAM_BOT_USERNAME

WORKDIR /app/apps/web
RUN npm run build

# Nginx runtime stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
