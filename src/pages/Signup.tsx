import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <AuthLayout>
      <SignupForm
        onSwitchToSignin={() => navigate("/login", { replace: true })}
      />
    </AuthLayout>
  );
}

