import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const backendUrl = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3099";
      
      // Better Auth endpoint: POST /api/auth/forget-password
      const response = await fetch(`${backendUrl}/api/auth/forget-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.error) {
        setError(
          result.error?.message || 
          result.message || 
          "Failed to send reset email. Please try again."
        );
        return;
      }

      // Success - show success message
      setSuccess("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Password reset request error:", err);
      // Handle network errors specifically
      if (err.message?.includes("Failed to fetch") || err.message?.includes("ERR_CONNECTION_REFUSED")) {
        setError("Cannot connect to server. Please make sure the backend is running on localhost:3099");
      } else {
        setError(err?.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={`h-12 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } bg-white`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

