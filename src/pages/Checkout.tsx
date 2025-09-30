"use client";

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
import { Link } from "react-router-dom";

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    // Handle order placement with Stripe
    try {
      // Stripe payment processing will go here
      console.log("Processing order...");
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Redirect to success page
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Shipping Address
                        </h3>
                        <p className="text-sm text-gray-600">
                          John Doe
                          <br />
                          123 Main St
                          <br />
                          New York, NY 10001
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Payment Method
                        </h3>
                        <p className="text-sm text-gray-600">
                          •••• •••• •••• 4242
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
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
                      className="flex-1 bg-red-600 hover:bg-red-700"
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
  );
}
