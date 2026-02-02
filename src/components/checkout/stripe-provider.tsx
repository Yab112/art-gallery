import { stripePromise } from "@/lib/stripe"
import { Elements } from "@stripe/react-stripe-js"

interface StripeProviderProps {
    children: React.ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
    return <Elements stripe={stripePromise}>{children}</Elements>
}
