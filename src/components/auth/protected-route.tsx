import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const defaultRedirect = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return <>{children}</>;
}

