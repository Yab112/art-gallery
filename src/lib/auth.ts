import { createAuthClient } from "better-auth/react";

// Better Auth client configuration
// Note: baseURL should be the server origin only, not including /api/auth
// Better Auth client automatically appends /api/auth to the baseURL
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000",
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
} = authClient;

// Export types
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];

