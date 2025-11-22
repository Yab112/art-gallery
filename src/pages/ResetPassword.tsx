import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  useEffect(() => {
    // Check if token exists in URL
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use Better Auth resetPassword
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token: token,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Failed to reset password. The link may have expired."
        );
        return;
      }

      // Success - show success message
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="w-full space-y-6 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Password Reset Successful!
            </h1>
            <p className="text-gray-500">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Redirecting to login page...
          </div>
          <Button
            onClick={() => navigate("/login", { replace: true })}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500">
            Enter your new password below to reset your account password.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                  },
                })}
                className={`h-12 pr-10 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } bg-white`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters and contain uppercase,
              lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className={`h-12 pr-10 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } bg-white`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-medium"
            disabled={isLoading || !token}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
