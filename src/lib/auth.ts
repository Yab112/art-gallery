import { createAuthClient } from "better-auth/react";

// Better Auth client configuration
// Note: baseURL should be the server origin only, not including /api/auth
// Better Auth client automatically appends /api/auth to the baseURL
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3099",
  // Enable credentials for cookies (required for cross-origin requests)
  fetchOptions: {
    credentials: "include",
  },
});

// Export auth methods for easy access
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Helper functions for social authentication
export const signInWithGoogle = async (options?: {
  callbackURL?: string;
  isSignUp?: boolean;
}) => {
  try {
    // Use absolute frontend URL for callback
    const frontendURL = window.location.origin;
    const callbackPath =
      options?.callbackURL || window.location.pathname || "/";
    const callbackURL = callbackPath.startsWith("http")
      ? callbackPath
      : `${frontendURL}${callbackPath}`;

    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackURL, // Absolute frontend URL for redirect after OAuth
    });

    // Note: Better Auth will handle the redirect automatically
    // If account doesn't exist, it will be created automatically
    // If account exists, user will be signed in
  } catch (error: any) {
    console.error("Google authentication error:", error);

    // Provide more specific error messages
    if (error?.message?.includes("popup")) {
      throw new Error("Popup was blocked. Please allow popups for this site.");
    }
    if (error?.message?.includes("network")) {
      throw new Error(
        "Network error. Please check your connection and try again."
      );
    }
    if (
      error?.message?.includes("cancelled") ||
      error?.message?.includes("denied")
    ) {
      throw new Error("Google sign-in was cancelled. Please try again.");
    }

    throw error;
  }
};

// Export types
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
