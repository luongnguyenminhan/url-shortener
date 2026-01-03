export interface EnvConfig {
    API_ENDPOINT: string;
    BRAND_NAME: string;
    BRAND_LOGO: string;
}

export interface BrandConfig {
    name: string;
    logo: string;
}

export function loadEnvConfig(): EnvConfig {
    return {
        API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT || 'https://securescribe.wc504.io.vn/be/api',
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
