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

# Copy source code
COPY . .

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

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

# Switch back to nextjs user
USER nextjs

EXPOSE 3030

# Use entrypoint to generate config and start app
ENTRYPOINT ["/entrypoint.sh"]
CMD ["dumb-init", "yarn", "preview"]
