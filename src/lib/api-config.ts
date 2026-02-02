/**
 * Centralized API Configuration
 *
 * This module provides a single source of truth for API base URLs.
 * It handles environment detection and provides fallbacks to prevent
 * requests from going to localhost in production.
 */

/**
 * Detects if the application is running in production
 * Uses Vite's built-in environment mode for reliable detection
 */
const isProduction = (): boolean => {
    // Use Vite's built-in production mode check
    return import.meta.env.PROD
}

/**
 * Gets the API base URL with intelligent fallbacks
 * Priority:
 * 1. Environment variable (VITE_BETTER_AUTH_URL or VITE_SERVER_BASE_URL)
 * 2. In production: Use window.location.origin
 * 3. In development: Use localhost with default port
 */
export const getApiBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_BETTER_AUTH_URL

    // If env variable is set and valid, use it
    if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
        return envUrl
    }

    // In production, default to same origin (the server should be serving the API)
    if (isProduction()) {
        return window.location.origin
    }

    // In development, use localhost with default backend port
    return "http://localhost:3099"
}

/**
 * Gets the server API base URL (with /api suffix)
 */
export const getServerBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_SERVER_BASE_URL

    // If env variable is set and valid, use it
    if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
        return envUrl
    }

    // Otherwise, append /api to the API base URL
    return `${getApiBaseUrl()}/api`
}

/**
 * Gets the frontend URL for OAuth callbacks
 */
export const getFrontendUrl = (): string => {
    const envUrl = import.meta.env.VITE_FRONTEND_URL

    // If env variable is set and valid, use it
    if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
        return envUrl
    }

    // Default to current origin
    return window.location.origin
}

// Log the configuration on initialization (development only)
if (import.meta.env.DEV) {
    console.log("🔧 API Configuration:", {
        apiBaseUrl: getApiBaseUrl(),
        serverBaseUrl: getServerBaseUrl(),
        frontendUrl: getFrontendUrl(),
        isProduction: isProduction()
    })
}
