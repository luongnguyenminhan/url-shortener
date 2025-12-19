# Declare build argument at the top level
ARG RUNTIME_IMAGE=runtime:latest

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# Copy all source files
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build app
RUN yarn build

# Application stage - uses runtime base image
FROM ${RUNTIME_IMAGE} 

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3030

# Switch to root to copy files
USER root

# Copy built app from builder
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy node_modules from builder (includes all deps needed)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch back to nextjs user
USER nextjs

EXPOSE 3030

# Start Vite preview server on port 3030
CMD ["yarn", "preview", "--", "--host", "0.0.0.0", "--port", "3030"]
