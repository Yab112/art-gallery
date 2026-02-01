import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl, getFrontendUrl } from "./api-config";

// Better Auth client configuration
// Note: baseURL should be the server origin only, not including /api/auth
// Better Auth client automatically appends /api/auth to the baseURL
const betterAuthBaseURL = getApiBaseUrl();

// Log configuration only in development
if (import.meta.env.DEV) {
  console.log("🔐 Frontend Better Auth baseURL:", betterAuthBaseURL);
}

export const authClient = createAuthClient({
  baseURL: betterAuthBaseURL,
  // Enable credentials for cookies (required for cross-origin requests)
  fetchOptions: {
    credentials: "include",
  },
});

// Export auth methods for easy access
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  changePassword,
} = authClient;

// Helper functions for social authentication
export const signInWithGoogle = async () => {
  try {
    // Use full frontend URL for callback to ensure proper redirect after OAuth
    // This ensures Better Auth redirects to the frontend, not the backend
    const frontendUrl = getFrontendUrl();
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${frontendUrl}/`, // Full frontend URL for proper redirect
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Export types
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];