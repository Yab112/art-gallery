import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth";

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
            // Success - show success message
            setSuccess(
              "Account created successfully! Please check your email to verify your account."
            );
            reset();
            setIsLoading(false);
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Failed to create account. Please try again.");
            setIsLoading(false);
          },
        }
      );

      // Handle result if it's returned synchronously
      if (result?.error) {
        setError(result.error.message || "Failed to create account. Please try again.");
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

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
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
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>

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
