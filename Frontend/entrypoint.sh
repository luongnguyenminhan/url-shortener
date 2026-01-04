#!/bin/sh

# Entrypoint script for Frontend Docker container
# Loads configuration from Vault and generates runtime env config
# Follows the same pattern as Backend's vault_loader.py

set -e

echo "🔐 Loading frontend configuration from Vault..."

# Determine environment
FRONTEND_ENV="${FRONTEND_ENV:-development}"
VAULT_CONFIG_PATH="/vault/secrets/configuration.${FRONTEND_ENV}.json"

# Load configuration from Vault file
load_vault_config() {
    if [ ! -f "$VAULT_CONFIG_PATH" ]; then
        echo "⚠️  Vault configuration file not found: $VAULT_CONFIG_PATH"
        echo "💡 Using default configuration values"
        set_defaults
        return
    fi

    echo "✓ Reading Vault configuration from: $VAULT_CONFIG_PATH"
    
    # Extract values from JSON file
    if command -v jq &> /dev/null; then
        # Using jq if available for robust JSON parsing
        export API_ENDPOINT=$(jq -r '.API_ENDPOINT // empty' "$VAULT_CONFIG_PATH" 2>/dev/null || echo "")
        export BRAND_NAME=$(jq -r '.BRAND_NAME // empty' "$VAULT_CONFIG_PATH" 2>/dev/null || echo "")
        export BRAND_LOGO=$(jq -r '.BRAND_LOGO // empty' "$VAULT_CONFIG_PATH" 2>/dev/null || echo "")
    else
        # Fallback: simple grep-based extraction for minimal images
        export API_ENDPOINT=$(grep -o '"API_ENDPOINT":"[^"]*' "$VAULT_CONFIG_PATH" | cut -d'"' -f4)
        export BRAND_NAME=$(grep -o '"BRAND_NAME":"[^"]*' "$VAULT_CONFIG_PATH" | cut -d'"' -f4)
        export BRAND_LOGO=$(grep -o '"BRAND_LOGO":"[^"]*' "$VAULT_CONFIG_PATH" | cut -d'"' -f4)
    fi
    
    # Apply defaults if not set from vault
    set_defaults
    
    echo "✓ Loaded configuration from Vault"
}

set_defaults() {
    # Set defaults if environment variables are empty
    API_ENDPOINT="${API_ENDPOINT:-http://nginx/api}"
    BRAND_NAME="${BRAND_NAME:-FPT Telecom}"
    BRAND_LOGO="${BRAND_LOGO:-/images/logos/logo.png}"
    
    # Export for subsequent use
    export API_ENDPOINT BRAND_NAME BRAND_LOGO
}

# Load the configuration
load_vault_config

echo "✅ Configuration loaded successfully"
echo "   API_ENDPOINT: $API_ENDPOINT"
echo "   BRAND_NAME: $BRAND_NAME"
echo "   BRAND_LOGO: $BRAND_LOGO"

# Generate runtime config file from environment variables
# This allows the frontend to access config at runtime
echo "📝 Generating runtime environment configuration..."
mkdir -p /usr/share/nginx/html/public

cat > /usr/share/nginx/html/public/env-config.js << EOF
// Auto-generated at container startup
window.__ENV__ = {
    API_ENDPOINT: '$API_ENDPOINT',
    BRAND_NAME: '$BRAND_NAME',
    BRAND_LOGO: '$BRAND_LOGO',
};
EOF

echo "✓ Runtime config generated at /usr/share/nginx/html/public/env-config.js"

# Start nginx
echo "🌐 Starting nginx on port 3030..."
exec nginx -g "daemon off;"