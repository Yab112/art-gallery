import { useState } from "react";
import { ArrowLeft, CreditCard, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentForm } from "@/components/checkout/payment-form";
import { ShippingInfo } from "@/components/checkout/shipping-info";
// import { StripeProvider } from "@/components/checkout/stripe-provider";
import { Link, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CheckoutProvider, useCheckout } from "@/contexts/CheckoutContext";
import { useCreateOrder } from "@/services/order/useCreateOrder";
import { useInitializePayment } from "@/services/payment/useInitializePayment";
import { useCartItems } from "@/queries/cartQueries";
import { toast } from "sonner";

function CheckoutContent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { shippingData, paymentData } = useCheckout();
  const { data: cartData } = useCartItems(1, 50);
  const { mutateAsync: createOrder } = useCreateOrder();
  const { mutateAsync: initializePayment } = useInitializePayment();

  // Force refresh to clear cache

  const steps = [
    { id: 1, name: "Shipping", icon: Truck },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: Shield },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingData || !paymentData) {
      setError("Please complete all checkout steps");
      toast.error("Please complete all checkout steps");
      return;
    }

    if (!cartData?.items || cartData.items.length === 0) {
      setError("Your cart is empty");
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare order items from cart with prices
      const orderItems = cartData.items.map(item => {
        const price = Number(item.artwork?.desiredPrice) || 0;
        if (price <= 0) {
          throw new Error(`Invalid price for artwork ${item.artwork?.title || item.artworkId}`);
        }
        return {
          artworkId: item.artworkId,
          quantity: item.quantity,
          price: price, // Include price from artwork (must be a number)
        };
      });

      // Create shipping address object (not string)
      const shippingAddressObj = {
        fullName: `${shippingData.firstName} ${shippingData.lastName}`,
        phone: shippingData.phone,
        address: `${shippingData.address}${shippingData.apartment ? ', ' + shippingData.apartment : ''}`,
        city: shippingData.city,
        state: shippingData.state,
        zipCode: shippingData.zipCode,
        country: shippingData.country || 'US',
      };

      // Step 1: Create order
      const orderResponse = await createOrder({
        buyerEmail: shippingData.email,
        shippingAddress: shippingAddressObj,
        paymentMethod: paymentData.provider, // chapa, paypal, or card
        items: orderItems,
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to create order");
      }

      const { txRef, totalAmount } = orderResponse.data;

      // Determine currency based on payment provider
      const currency = paymentData.provider === 'chapa' ? 'ETB' : 'USD';

      // Step 2: Initialize payment
      const paymentResponse = await initializePayment({
        provider: paymentData.provider,
        amount: totalAmount,
        currency,
        email: shippingData.email,
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        phoneNumber: paymentData.phoneNumber || shippingData.phone,
        txRef,
      });

      // Payment hook will redirect to checkout URL automatically
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || "Failed to initialize payment");
      }

    } catch (error: any) {
      console.error("Order placement failed:", error);
      setError(error?.message || "Failed to process order. Please try again.");
      toast.error(error?.message || "Failed to process order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/buyart"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
            <div className="text-2xl font-bold text-red-700">artalistic</div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          isActive
                            ? "border-red-500 bg-red-500 text-white"
                            : isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 bg-white text-gray-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`text-sm font-medium ${
                            isActive
                              ? "text-red-600"
                              : isCompleted
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {step.name}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`ml-8 h-0.5 w-16 ${
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              {currentStep === 1 && <ShippingInfo onNext={handleNext} />}

              {currentStep === 2 && (
                <PaymentForm onNext={handleNext} onPrevious={handlePrevious} />
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Review Your Order
                    </h2>
                    <p className="text-gray-600">
                      Please review your order details before placing it.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Shipping Address
                        </h3>
                        <p className="text-sm text-gray-600">
                          {shippingData ? (
                            <>
                              {shippingData.firstName} {shippingData.lastName}
                              <br />
                              {shippingData.address}
                              {shippingData.apartment && `, ${shippingData.apartment}`}
                              <br />
                              {shippingData.city}, {shippingData.state} {shippingData.zipCode}
                              <br />
                              {shippingData.country}
                            </>
                          ) : (
                            <span className="text-red-600">No shipping information provided</span>
                          )}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                        Edit
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Payment Method
                        </h3>
                        <p className="text-sm text-gray-600">
                          {paymentData ? (
                            paymentData.provider === 'chapa' ? (
                              <>Chapa (Mobile Money, Bank Transfer)</>
                            ) : paymentData.provider === 'paypal' ? (
                              <>PayPal</>
                            ) : (
                              <>Credit/Debit Card</>
                            )
                          ) : (
                            <span className="text-red-600">No payment method selected</span>
                          )}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-red-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-red-600 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex-1 bg-white"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 bg-red-700 hover:bg-red-800 text-white"
                    >
                      {isProcessing ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
