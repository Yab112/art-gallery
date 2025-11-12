import { useSession, signOut } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import type { User } from "@/lib/auth";

/**
 * Custom hook for authentication state and actions
 * Provides easy access to user session and auth methods
 */
export const useAuth = () => {
  const { data: session, isPending, error } = useSession();
  const navigate = useNavigate();

  // Better Auth useSession returns { data: session, isPending, error }
  // session has { user, session } structure
  const user: User | null = session?.user || null;
  const isAuthenticated = !!user;
  const isLoading = isPending;

  const logout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
      // Small delay to ensure session is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    session: session || null,
    error,
  };
};

