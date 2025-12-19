#!/bin/sh

# Entrypoint script for Docker container
# Generate runtime env file from environment variables

echo "🚀 Generating runtime config from environment variables..."

# Set defaults if not provided
API_ENDPOINT="${API_ENDPOINT:-http://nginx/api}"
BRAND_NAME="${BRAND_NAME:-SecureScribe}"
BRAND_LOGO="${BRAND_LOGO:-/images/logos/logo.png}"

# Export for envsubst
export API_ENDPOINT BRAND_NAME BRAND_LOGO

# Generate env-config.js from template (for Vite, generate in dist/public)
mkdir -p /app/dist/public
envsubst < /app/public/env-config.js > /app/dist/public/env-config.js

echo "✅ Runtime config generated"
echo "   API_ENDPOINT: $API_ENDPOINT"
echo "   BRAND_NAME: $BRAND_NAME"

# Start Vite preview application on port 3030
echo "🌐 Starting Vite preview application on port 3030..."
exec yarn preview -- --host 0.0.0.0 --port 3030