import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useVerifyPayment } from "@/services/payment/useVerifyPayment";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const orderId = searchParams.get("orderId");
  // PayPal returns 'token' instead of 'txRef', so check both
  const txRef = searchParams.get("txRef") || searchParams.get("token");
  const provider = searchParams.get("provider") || "chapa"; // Default to chapa if not specified
  
  const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    // Verify payment when page loads if txRef is available
    if (txRef && provider) {
      verifyPayment(
        { 
          provider: provider as 'chapa' | 'paypal', 
          txRef 
        },
        {
          onSuccess: (data) => {
            if (data.success && data.data.status === 'success') {
              setVerificationStatus('success');
              toast.success("Payment verified successfully!");
              
              // Invalidate orders cache to refresh the orders list
              // Uses authenticated user ID from session, not email
              queryClient.invalidateQueries({ 
                queryKey: ["user-orders"] 
              });
              // Also invalidate cart summary if user is logged in
              queryClient.invalidateQueries({ 
                queryKey: ["cart-summary"] 
              });
            } else {
              setVerificationStatus('failed');
              setVerificationError(data.message || "Payment verification failed");
              toast.error("Payment verification failed. Please contact support.");
            }
          },
          onError: (error: any) => {
            setVerificationStatus('failed');
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to verify payment";
            setVerificationError(errorMessage);
            toast.error("Failed to verify payment. Please contact support.");
          }
        }
      );
    } else {
      // If no txRef, mark as failed
      setVerificationStatus('failed');
      setVerificationError("Transaction reference not found");
    }
  }, [txRef, provider, verifyPayment]);

  // Show loading state while verifying
  if (isVerifying || verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your payment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if verification failed
  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Verification Failed
            </h1>
            <p className="text-gray-600 mb-4">
              {verificationError || "We couldn't verify your payment. Please contact support with your transaction reference."}
            </p>
            {txRef && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Transaction Reference</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {txRef}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/buyart")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        {orderId && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {orderId}
            </p>
          </div>
        )}

        {txRef && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Transaction Reference</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {txRef}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You will receive an email confirmation shortly with your order details.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full bg-red-700 hover:bg-red-800 text-white"
            >
              <Link to="/orders">
                View My Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/buyart")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
