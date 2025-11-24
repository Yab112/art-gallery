import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    // If token is provided, verify automatically
    if (token && email) {
      handleVerifyWithToken(token);
    } else if (!email && !token) {
      // Redirect if no email provided and no token
      navigate("/signup", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  const handleVerifyWithToken = async (verificationToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Better-auth verify-email endpoint expects GET request with token as query parameter
      const backendUrl = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3099";
      
      // Better-auth verification endpoint format: GET /api/auth/verify-email?token=xxx
      const response = await fetch(
        `${backendUrl}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      // Better-auth might return HTML redirect or JSON
      const contentType = response.headers.get("content-type");
      let data: any = {};

      if (contentType && contentType.includes("application/json")) {
        data = await response.json().catch(() => ({}));
      } else {
        // If HTML response, check status code
        const text = await response.text().catch(() => "");
        if (response.ok) {
          // Success - better-auth might redirect or return HTML
          setSuccess(true);
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
          return;
        } else {
          setError("Invalid or expired verification link. Please request a new one.");
          return;
        }
      }

      if (!response.ok || data.error) {
        setError(
          data.error?.message ||
            data.message ||
            "Invalid or expired verification link. Please request a new one."
        );
        return;
      }

      // Success
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Countdown timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (!email || resendTimer > 0) return;

    setIsResending(true);
    setError(null);

    try {
      // Resend verification email
      const result = await authClient.sendVerificationEmail({
        email: email,
      });

      if (result.error) {
        setError(result.error.message || "Failed to resend verification email.");
        return;
      }

      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Start countdown
      setResendTimer(60);
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  if (success && token) {
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
              Email Verified!
            </h1>
            <p className="text-gray-500">
              Your email has been verified successfully. You can now log in to
              your account.
            </p>
          </div>
          <div className="text-sm text-gray-600">Redirecting to login...</div>
        </div>
      </AuthLayout>
    );
  }

  // Show loading state while verifying with token
  if (isLoading && token) {
    return (
      <AuthLayout>
        <div className="w-full space-y-6 text-center">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Verifying Email...
            </h1>
            <p className="text-gray-500">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <button
          onClick={() => navigate("/signup", { replace: true })}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign Up
        </button>

        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <Mail className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-500">
            We've sent a verification link to
          </p>
          <p className="text-gray-900 font-medium">{email}</p>
          <p className="text-sm text-gray-500">
            Please check your email and click the verification link to verify your account.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && !token && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Verification email sent! Please check your inbox.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 mb-2">
              Click the link in your email to verify your account
            </p>
            <p className="text-sm text-gray-500">
              The verification link will expire in 24 hours
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the email?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendTimer > 0}
                className="text-red-700 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : isResending
                  ? "Sending..."
                  : "Resend Email"}
              </button>
            </p>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Already verified? Login
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
