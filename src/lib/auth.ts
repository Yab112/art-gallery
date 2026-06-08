import { createAuthClient } from "better-auth/react"
import { getApiBaseUrl, getFrontendUrl } from "./api-config"
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
        auth: {
            type: "Bearer",
            token: () => getBearerToken() || "",
        },
    },
})

// Export auth methods for easy access
export const { signIn, signUp, useSession, getSession, changePassword } = authClient

export const signOut = async (
    options?: Parameters<typeof authClient.signOut>[0],
) => {
    clearBearerToken()
    return authClient.signOut(options)
}

// Helper functions for social authentication
export const signInWithGoogle = async () => {
    try {
        // Use full frontend URL for callback to ensure proper redirect after OAuth
        // This ensures Better Auth redirects to the frontend, not the backend
        const frontendUrl = getFrontendUrl()
        await authClient.signIn.social({
            provider: "google",
            callbackURL: `${frontendUrl}/` // Full frontend URL for proper redirect
        })
    } catch (error) {
        console.error("Google sign-in error:", error)
        throw error
    }
}

// Export types
export type Session = typeof authClient.$Infer.Session
export type User = Session["user"]
