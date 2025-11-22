import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Download, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyPayment } from "@/services/payment/useVerifyPayment";
import { useGetOrder } from "@/services/order/useGetOrder";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Handle PayPal's return format: token parameter is the order ID
  // Handle Chapa's return format: tx_ref parameter
  const paypalToken = searchParams.get("token");
  const txRef = searchParams.get("tx_ref") || searchParams.get("txRef") || paypalToken;
  const provider = (searchParams.get("provider") || (paypalToken ? "paypal" : "chapa")) as "chapa" | "paypal";

  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const { data: order, isLoading: isLoadingOrder } = useGetOrder(orderId);

  useEffect(() => {
    if (!txRef) {
      setVerificationStatus("error");
      setErrorMessage("No transaction reference found");
      return;
    }

    const verifyTransaction = async () => {
      try {
        const response = await verifyPayment({ provider, txRef });

        // PayPal returns status as "completed" or "approved", Chapa returns "success"
        const isSuccess = response.success && (
          response.data.status === "success" || 
          response.data.status === "completed" || 
          response.data.status === "approved"
        );

        if (isSuccess) {
          setVerificationStatus("success");

          // Extract orderId from txRef (format: TX-{orderId}-{timestamp})
          // For PayPal, use originalTxRef if available, otherwise try to extract from txRef
          let orderIdToExtract = txRef;
          
          if (provider === "paypal" && response.data.originalTxRef) {
            // Use the original txRef that contains the order ID
            orderIdToExtract = response.data.originalTxRef;
          }
          
          // Extract order ID from txRef format: TX-{orderId}-{timestamp}
          const txRefParts = orderIdToExtract.split("-");
          if (txRefParts.length >= 2 && txRefParts[0] === "TX") {
            setOrderId(txRefParts[1]);
          }
        } else {
          setVerificationStatus("error");
          setErrorMessage(response.data.chargeResponseMessage || "Payment verification failed");
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setVerificationStatus("error");
        setErrorMessage(error?.message || "An error occurred during verification");
      }
    };

    verifyTransaction();
  }, [txRef, provider, verifyPayment]);

  // Loading state
  if (verificationStatus === "loading" || (verificationStatus === "success" && isLoadingOrder)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || "We couldn't verify your payment. Please try again."}
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/checkout")}
              className="flex-1"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate("/buyart")}
              className="flex-1 bg-red-700 hover:bg-red-800"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {order && (
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono font-semibold">{order.id}</span>
            </p>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Items Purchased</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                    {item.artwork?.imageUrl && (
                      <img
                        src={item.artwork.imageUrl}
                        alt={item.artwork.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.artwork?.title || "Artwork"}
                      </h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <p className="text-gray-600 text-sm">
                {order.shippingAddress || "No shipping address provided"}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal (Artworks)</span>
                <span className="text-gray-900">
                  ${order.transaction?.metadata?.subtotal?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee (10%)</span>
                <span className="text-gray-900">
                  ${order.transaction?.metadata?.platformFee?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                <span>Artist Earnings (90%)</span>
                <span className="font-semibold">
                  ${((order.transaction?.metadata?.subtotal || 0) * 0.9).toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total Paid</span>
                  <span className="text-gray-900">${Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Order Processing</h3>
                <p className="text-sm text-gray-600">
                  Your order is being prepared for shipment. You'll receive a confirmation email shortly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Artist Notified</h3>
                <p className="text-sm text-gray-600">
                  The artist has been notified and will begin processing your order.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="flex-1"
          >
            View All Orders
          </Button>
          <Button
            onClick={() => navigate("/buyart")}
            className="flex-1 bg-red-700 hover:bg-red-800 text-white"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
