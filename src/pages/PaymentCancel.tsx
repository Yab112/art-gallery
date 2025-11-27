import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider") || "unknown";
  const token = searchParams.get("token"); // PayPal order ID if available

  const getProviderName = () => {
    switch (provider.toLowerCase()) {
      case "paypal":
        return "PayPal";
      case "chapa":
        return "Chapa";
      default:
        return "Payment Provider";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-4">
            Your payment with {getProviderName()} was cancelled. No charges have been made to your account.
          </p>
          <p className="text-sm text-gray-500">
            You can try again or choose a different payment method.
          </p>
        </div>

        {token && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {token}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your order has been saved but is not yet paid. 
              You can complete the payment from your orders page.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full bg-red-700 hover:bg-red-800 text-white"
            >
              <Link to="/checkout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Payment Again
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/orders")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
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
    </div>
  );
}

