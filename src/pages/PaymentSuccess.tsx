import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const txRef = searchParams.get("txRef");

  useEffect(() => {
    // Clear any checkout context data
    // You might want to clear the checkout context here
  }, []);

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
