# Build stage - uses node:20-alpine to get all dependencies (dev + prod)
FROM node:20-alpine AS builder

WORKDIR /app

# Install Yarn
RUN corepack enable

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (dev + production)
RUN yarn install --frozen-lockfile

# Copy all source files
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build app
RUN yarn build

# Production stage - use nginx to serve (lightweight, avoids host blocking)
FROM nginx:stable-alpine

# Install jq for robust JSON parsing in entrypoint
RUN apk add --no-cache jq

# Copy built app from builder to nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create default nginx config for SPA
RUN echo 'server { \
    listen 3030; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3030

# Use entrypoint script to load vault config and start nginx
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
