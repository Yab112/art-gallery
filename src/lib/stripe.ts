import { loadStripe } from "@stripe/stripe-js";

// Replace with your actual Stripe publishable key
const stripePublishableKey =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_your_publishable_key_here";

export const stripePromise = loadStripe(stripePublishableKey);

// Stripe configuration
export const stripeConfig = {
  publishableKey: stripePublishableKey,
  // Add other Stripe configuration options here
};
