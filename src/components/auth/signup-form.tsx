import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PasswordStrengthIndicator,
  isPasswordValid,
} from "@/components/ui/password-strength-indicator";
import { signInWithGoogle, signUp } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthNavigationProps {
  onSwitchToSignin: () => void;
}

export function SignupForm({ onSwitchToSignin }: AuthNavigationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handler for Google sign-up
  const handleGoogleSignUp = async () => {
    setIsSocialLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || "Failed to sign up with Google");
      setIsSocialLoading(false);
    }
  };

  const form = useForm<SignupFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = form;

  // Watch password fields for real-time strength indicator
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use Better Auth signUp with proper error handling
      const result = await signUp.email(
        {
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
          // Additional fields can be passed here if needed
        },
        {
          onSuccess: () => {
            // Success - redirect to verify email page
            reset();
            setIsLoading(false);
            navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
          },
          onError: (ctx) => {
            setError(
              ctx.error?.message ||
                "Failed to create account. Please try again.",
            );
            setIsLoading(false);
          },
        },
      );

      // Handle result if it's returned synchronously
      if (result?.error) {
        setError(
          result.error.message || "Failed to create account. Please try again.",
        );
        setIsLoading(false);
        return;
      }

      // If result is successful and returned synchronously (no error), redirect
      if (result && !result.error) {
        reset();
        setIsLoading(false);
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-8">
      <div className="space-y-1 sm:space-y-3 text-left">
        <h1 className="font-serif text-2xl sm:text-4xl text-gray-900 tracking-tight">
          Create Account
        </h1>
        <p className="font-medium text-gray-500 text-xs sm:text-sm">
          Join our community of art collectors.
        </p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="py-2 border-red-200 bg-red-50 text-red-800 text-xs"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1">
            <Label
              htmlFor="firstName"
              className="font-semibold text-gray-700 text-[10px] uppercase tracking-widest"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="e.g. John"
              {...register("firstName", { required: "First name is required" })}
              className={`h-10 sm:h-12 border-gray-200 bg-white px-3 sm:px-4 transition-all focus:border-gray-900 focus:ring-0 ${
                errors.firstName ? "border-red-500" : ""
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-[10px]">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="lastName"
              className="font-semibold text-gray-700 text-[10px] uppercase tracking-widest"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="e.g. Doe"
              {...register("lastName", { required: "Last name is required" })}
              className={`h-10 sm:h-12 border-gray-200 bg-white px-3 sm:px-4 transition-all focus:border-gray-900 focus:ring-0 ${
                errors.lastName ? "border-red-500" : ""
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-[10px]">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="email"
            className="font-semibold text-gray-700 text-[10px] uppercase tracking-widest"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. collector@arthopia.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className={`h-10 sm:h-12 border-gray-200 bg-white px-3 sm:px-4 transition-all focus:border-gray-900 focus:ring-0 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-[10px]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="password"
            className="font-semibold text-gray-700 text-[10px] uppercase tracking-widest"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                validate: (value) =>
                  isPasswordValid(value) ||
                  "Password must meet strength requirements",
              })}
              className={`h-10 sm:h-12 border-gray-200 bg-white px-3 sm:px-4 pr-10 transition-all focus:border-gray-900 focus:ring-0 ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="-translate-y-1/2 absolute top-1/2 right-3 transform text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[10px]">{errors.password.message}</p>
          )}

          <div className="pt-1">
            <PasswordStrengthIndicator
              password={password || ""}
              confirmPassword={confirmPassword || ""}
              showRequirements={false}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="confirmPassword"
            className="font-semibold text-gray-700 text-[10px] uppercase tracking-widest"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value, formValues) =>
                  value === formValues.password || "Passwords do not match",
              })}
              className={`h-10 sm:h-12 border-gray-200 bg-white px-3 sm:px-4 pr-10 transition-all focus:border-gray-900 focus:ring-0 ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="-translate-y-1/2 absolute top-1/2 right-3 transform text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-[10px]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 sm:h-12 w-full rounded-none bg-gray-900 font-bold text-white tracking-widest uppercase text-[10px] sm:text-xs transition-all hover:bg-black"
          disabled={isLoading || isSocialLoading}
        >
          {isLoading ? "Creating..." : "Create Account"}
        </Button>
      </form>

      {/* Social Login Divider */}
      <div className="relative py-2 sm:py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-gray-100 border-t" />
        </div>
        <div className="relative flex justify-center text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">
          <span className="bg-white px-4 text-gray-400">Or sign up with</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="h-10 sm:h-12 w-full rounded-none border-gray-200 bg-white font-semibold text-gray-700 text-[10px] sm:text-xs transition-all hover:bg-gray-50"
          disabled={isLoading || isSocialLoading}
          onClick={handleGoogleSignUp}
        >
          <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
      </div>

      <div className="space-y-2 sm:space-y-4 pt-2 sm:pt-4 text-center">
        <p className="text-gray-500 text-[10px] sm:text-xs">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignin}
            className="font-bold text-gray-900 underline underline-offset-4 hover:text-red-700"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
