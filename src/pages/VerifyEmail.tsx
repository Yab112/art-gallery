import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OTPInput } from "@/components/ui/otp-input";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (otpValue: string) => {
    if (otpValue.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use Better Auth verifyEmail
      const result = await authClient.verifyEmail({
        email: email!,
        code: otpValue,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Invalid verification code. Please try again."
        );
        setOtp("");
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
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

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
        setError(result.error.message || "Failed to resend code.");
        return;
      }

      // Start countdown
      setResendTimer(60);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
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
            We've sent a verification code to
          </p>
          <p className="text-gray-900 font-medium">{email}</p>
          <p className="text-sm text-gray-500">
            Enter the 6-digit code to verify your email address
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="flex justify-center">
            <OTPInput
              length={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={() => handleVerify(otp)}
            className="w-full h-12 bg-red-700 hover:bg-red-800 text-white font-medium"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
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
                  : "Resend Code"}
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
