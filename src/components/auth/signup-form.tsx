import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { signUp, signInWithGoogle } from "@/lib/auth";
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
  const navigate = useNavigate();

  // Handler for Google sign-up
  const handleGoogleSignUp = async () => {
    setIsSocialLoading(true);
    setError(null);
    try {
      // Better Auth will automatically create account if it doesn't exist
      // Redirect will happen automatically via Better Auth
      await signInWithGoogle({
        callbackURL: "/", // Redirect to home after successful sign-up
        isSignUp: true,
      });
      // Note: If successful, Better Auth will redirect automatically
      // We don't need to handle success here as the redirect happens
    } catch (err: any) {
      setError(
        err?.message || "Failed to sign up with Google. Please try again."
      );
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
  } = form;

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

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
            // Redirect to verify email page with email as query parameter
            navigate(`/verify-email?email=${encodeURIComponent(data.email)}`, {
              replace: true,
            });
          },
          onError: (ctx) => {
            setError(
              ctx.error?.message ||
                "Failed to create account. Please try again."
            );
            setIsLoading(false);
          },
        }
      );

      // Handle result if it's returned synchronously
      if (result?.error) {
        setError(
          result.error.message || "Failed to create account. Please try again."
        );
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
        <p className="text-gray-500">Create your account to get started.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              {...register("firstName", { required: "First name is required" })}
              className={`h-12 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } bg-white`}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              {...register("lastName", { required: "Last name is required" })}
              className={`h-12 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } bg-white`}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
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

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value, formValues) =>
                  value === formValues.password || "Passwords do not match",
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
          disabled={isLoading || isSocialLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>

      {/* Social Login Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or sign up with</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full border-gray-300 hover:bg-gray-50"
          disabled={isLoading || isSocialLoading}
          onClick={handleGoogleSignUp}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
          {isSocialLoading ? "Signing up..." : "Continue with Google"}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignin}
            className="text-red-700 hover:text-red-800 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
