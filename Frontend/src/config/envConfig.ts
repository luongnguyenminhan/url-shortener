export interface EnvConfig {
    API_ENDPOINT: string;
    BRAND_NAME: string;
    BRAND_LOGO: string;
}

export interface BrandConfig {
    name: string;
    logo: string;
}

declare global {
    interface Window {
        __ENV__?: EnvConfig;
    }
}

export function loadEnvConfig(): EnvConfig {
    // First, try to load from runtime-injected config (set by entrypoint.sh)
    if (window.__ENV__) {
        return window.__ENV__;
    }

    // Fallback to build-time environment variables (VITE_*)
    return {
        API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT || '/be/api',
        BRAND_NAME: import.meta.env.VITE_BRAND_NAME || 'FPT Telecom',
        BRAND_LOGO: import.meta.env.VITE_BRAND_LOGO || '/images/logos/logo.png',
    };
}

export function getApiEndpoint(): string {
    return loadEnvConfig().API_ENDPOINT;
}

export function getBrandConfig(): BrandConfig {
    const config = loadEnvConfig();
    return {
        name: config.BRAND_NAME,
        logo: config.BRAND_LOGO,
    };
}

export function getEnvConfig(): EnvConfig {
    return loadEnvConfig();
}
