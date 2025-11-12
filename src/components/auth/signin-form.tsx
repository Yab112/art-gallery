import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

interface SigninFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface AuthNavigationProps {
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export function SigninForm({
  onSwitchToSignup,
  onForgotPassword,
}: AuthNavigationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SigninFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const navigate = useNavigate();

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Better Auth signIn with proper error handling
      const result = await signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        },
        {
          onSuccess: () => {
            // Success - redirect to home
            reset();
            navigate("/", { replace: true });
            // Small delay to ensure session is updated
            setTimeout(() => {
              window.location.reload();
            }, 100);
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Failed to sign in. Please try again.");
            setIsLoading(false);
          },
        }
      );

      // Handle result if it's returned synchronously
      if (result?.error) {
        setError(result.error.message || "Failed to sign in. Please try again.");
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
        <h1 className="text-3xl font-bold text-gray-900">Login</h1>
        <p className="text-gray-500">
          Welcome back! Please login to your account.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            User Name
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="username@gmail.com"
            {...register("email", { required: "Email is required" })}
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
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={form.watch("rememberMe")}
              onCheckedChange={(checked) =>
                form.setValue("rememberMe", checked)
              }
            />
            <Label htmlFor="remember" className="text-sm text-gray-600">
              Remember Me
            </Label>
          </div>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          New User?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-red-700 hover:text-red-800 font-medium"
          >
            Signup
          </button>
        </p>
      </div>
    </div>
  );
}
