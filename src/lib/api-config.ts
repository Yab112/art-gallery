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
 * 1. Environment variable (VITE_BETTER_AUTH_URL)
 * 2. Fallback to current origin (for Better Auth)
 */
export const getApiBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_BETTER_AUTH_URL

    // If env variable is set and valid, use it
    if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
        return envUrl
    }

    // Default to current origin for auth if not specified
    if (typeof window !== "undefined") {
        return window.location.origin
    }

    return "http://localhost:5173" // Final fallback for SSR if needed
}

/**
 * Gets the server API base URL (with /api suffix)
 * Priority:
 * 1. Environment variable (VITE_SERVER_BASE_URL)
 * 2. VITE_BACKEND_URL + /api (if defined)
 * 3. Fallback based on getApiBaseUrl() + /api
 */
export const getServerBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_SERVER_BASE_URL
    if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
        return envUrl
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    if (backendUrl && typeof backendUrl === "string" && backendUrl.trim() !== "") {
        return `${backendUrl}/api`
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
    if (typeof window !== "undefined") {
        return window.location.origin
    }

    return "http://localhost:5173"
}

/**
 * Gets the Admin Dashboard URL
 */
export const getAdminUrl = (): string => {
    return import.meta.env.VITE_ADMIN_URL || "http://localhost:3001"
}

// Log the configuration on initialization (development only)
if (import.meta.env.DEV) {
    console.log("🔧 API Configuration:", {
        apiBaseUrl: getApiBaseUrl(),
        serverBaseUrl: getServerBaseUrl(),
        frontendUrl: getFrontendUrl(),
        adminUrl: getAdminUrl(),
        isProduction: isProduction()
    })
}
