import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface StripePaymentProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

export function StripePayment({
  amount,
  onSuccess,
  onError,
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement)!,
        });

      if (paymentMethodError) {
        setError(paymentMethodError.message || "Payment failed");
        onError(paymentMethodError.message || "Payment failed");
        return;
      }

      // Create payment intent on your backend
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: "usd",
          payment_method_id: paymentMethod.id,
        }),
      });

      const { client_secret, error: backendError } = await response.json();

      if (backendError) {
        setError(backendError);
        onError(backendError);
        return;
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(client_secret);

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        onError(confirmError.message || "Payment failed");
        return;
      }

      if (paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement options={cardElementOptions} />
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-red-600 hover:bg-red-700"
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}
