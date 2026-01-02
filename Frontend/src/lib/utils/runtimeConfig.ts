// utils/runtimeConfig.ts
export interface RuntimeConfig {
    API_ENDPOINT: string;
    BRAND_NAME: string;
    BRAND_LOGO: string;
}

let configCache: RuntimeConfig | null = null;

export function loadRuntimeConfig(): RuntimeConfig {
    // Return cached config if already loaded
    if (configCache) {
        return configCache;
    }

    // Read from window.__ENV__ injected by env-config.js
    if (typeof window !== 'undefined' && window.__ENV__) {
        const envConfig = window.__ENV__ as RuntimeConfig;

        // Validate required fields
        if (!envConfig.API_ENDPOINT) {
            return getFallbackConfig();
        }

        // Cache the config
        configCache = envConfig;
        return configCache;
    }

    // Fallback for server-side or when __ENV__ is not available
    return getFallbackConfig();
}

function getFallbackConfig(): RuntimeConfig {
    return {
        API_ENDPOINT: 'https://securescribe.wc504.io.vn/be/api',
        BRAND_NAME: 'FPT Telecom',
        BRAND_LOGO: '/images/logos/logo.png'
    };
}

// Helper function to get API endpoint specifically
export function getApiEndpoint(): string {
    const config = loadRuntimeConfig();
    return config.API_ENDPOINT;
}

// Helper function to get brand config
export function getBrandConfig(): { name: string; logo: string } {
    const config = loadRuntimeConfig();
    return {
        name: config.BRAND_NAME,
        logo: config.BRAND_LOGO
    };
}


// Type declaration for window.__ENV__
declare global {
    interface Window {
        __ENV__?: RuntimeConfig;
    }
}