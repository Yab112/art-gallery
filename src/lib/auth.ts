import { createAuthClient } from "better-auth/react"
import { getApiBaseUrl, getBackendOrigin, getFrontendUrl } from "./api-config"
import {
    captureAuthTokenFromResponse,
    clearBearerToken,
    getBearerToken,
} from "./bearer-token"

// Better Auth client configuration
// Note: baseURL should be the server origin only, not including /api/auth
// Better Auth client automatically appends /api/auth to the baseURL
const betterAuthBaseURL = getApiBaseUrl()

// Log configuration only in development
if (import.meta.env.DEV) {
    console.log("🔐 Frontend Better Auth baseURL:", betterAuthBaseURL)
}

export const authClient = createAuthClient({
    baseURL: betterAuthBaseURL,
    fetchOptions: {
        credentials: "include",
        onSuccess: (ctx) => {
            captureAuthTokenFromResponse(ctx.response)
        },
        // Only attach bearer when we have a token — empty Bearer breaks cookie auth
        auth: {
            type: "Bearer",
            token: () => getBearerToken() ?? undefined,
        },
    },
})

// Export auth methods for easy access
export const { signIn, signUp, useSession, getSession, changePassword } = authClient

export const signOut = async (
    options?: Parameters<typeof authClient.signOut>[0],
) => {
    try {
        await Promise.race([
            authClient.signOut(options),
            new Promise<void>((resolve) => setTimeout(resolve, 5000)),
        ])
    } catch (error) {
        console.warn("Sign out request failed:", error)
    }
}

/** Wipe local auth state and force a full page reload (SPA-safe). */
export function completeLogout() {
    clearBearerToken()
    sessionStorage.removeItem("authJustCompleted")
    sessionStorage.removeItem("authRedirect")

    const url = new URL(window.location.origin)
    url.pathname = "/"
    url.search = `?logout=${Date.now()}`
    window.location.replace(url.toString())
}

// Helper functions for social authentication
export const signInWithGoogle = async () => {
    try {
        const frontendUrl = getFrontendUrl()
        const callbackPath = `${frontendUrl}/auth/callback`

        // Production: Google OAuth hits Render, oauth-handoff redirects back with ?token=
        // Local dev: same flow when backend has oauth-handoff; otherwise falls back to frontend callback
        const useOAuthHandoff =
            import.meta.env.PROD ||
            import.meta.env.VITE_USE_OAUTH_HANDOFF === "true"

        const callbackURL = useOAuthHandoff
            ? `${getBackendOrigin()}/api/auth/oauth-handoff?redirect=${encodeURIComponent(callbackPath)}`
            : callbackPath

        await authClient.signIn.social({
            provider: "google",
            callbackURL,
        })
    } catch (error) {
        console.error("Google sign-in error:", error)
        throw error
    }
}

// Export types
export type Session = typeof authClient.$Infer.Session
export type User = Session["user"]
