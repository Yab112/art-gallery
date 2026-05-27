import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCheckout } from "@/contexts/CheckoutContext"
import { useGetPaymentMethodPreference } from "@/services/settings/usePaymentMethodPreference"
import { Lock } from "lucide-react"
import { useEffect, useState } from "react"
// import { StripePayment } from "./stripe-payment";

interface PaymentFormProps {
    onNext: () => void
    onPrevious: () => void
}

export function PaymentForm({ onNext, onPrevious }: PaymentFormProps) {
    const { paymentData, setPaymentData } = useCheckout()
    const { data: preference } = useGetPaymentMethodPreference()

    // Use user's preferred payment method as default, fallback to paymentData or 'paypal'
    const defaultMethod = preference?.paymentMethodPreference || paymentData?.provider || "paypal"
    const [paymentMethod, setPaymentMethod] = useState<"chapa" | "paypal">(
        defaultMethod as "chapa" | "paypal"
    )

    // Update payment method when preference loads
    useEffect(() => {
        if (preference?.paymentMethodPreference && !paymentData?.provider) {
            setPaymentMethod(preference.paymentMethodPreference as "chapa" | "paypal")
        }
    }, [preference, paymentData])






    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Save payment data to context
        setPaymentData({
            provider: paymentMethod as "chapa" | "paypal",
        })
        onNext()
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-2xl text-gray-900">Payment Information</h2>
                <p className="text-gray-600">
                    Choose your preferred payment method and enter your details.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                    <Label className="font-medium text-base">Payment Method</Label>
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="chapa"
                                name="paymentMethod"
                                value="chapa"
                                checked={paymentMethod === "chapa"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value as "chapa" | "paypal")
                                }
                                className="h-4 w-4 flex-shrink-0 border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Label
                                htmlFor="chapa"
                                className="flex cursor-pointer items-start gap-2 leading-tight"
                            >
                                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="#00A86B">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                </svg>
                                <span>Chapa (Mobile Money, Bank Transfer)</span>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="paypal"
                                name="paymentMethod"
                                value="paypal"
                                checked={paymentMethod === "paypal"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value as "chapa" | "paypal")
                                }
                                className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Label htmlFor="paypal" className="cursor-pointer">
                                PayPal (International)
                            </Label>
                        </div>

                    </div>
                </div>

                {paymentMethod === "chapa" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-green-100 p-2">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-2 font-semibold text-green-900">
                                        Pay with Chapa - Ethiopia's Payment Gateway
                                    </h3>
                                    <p className="mb-3 text-green-700 text-sm">
                                        You'll be redirected to Chapa's secure checkout to complete
                                        your payment using:
                                    </p>
                                    <ul className="ml-4 list-disc space-y-1 text-green-700 text-sm">
                                        <li>Telebirr</li>
                                        <li>CBE Birr</li>
                                        <li>Local Bank Accounts</li>
                                        <li>International Cards (Visa, Mastercard)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                )}



                {paymentMethod === "paypal" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-white p-2 shadow-sm">
                                    <svg
                                        className="h-8 w-8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                                            fill="#003087"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-2 font-semibold text-blue-900 text-lg">
                                        International Payment via PayPal
                                    </h3>
                                    <p className="mb-4 text-blue-700 text-sm leading-relaxed">
                                        You've selected PayPal for your international transaction.
                                        Here's what will happen:
                                    </p>
                                    <ul className="mb-4 ml-4 list-disc space-y-2 text-blue-700 text-sm">
                                        <li>Securely login to your PayPal account</li>
                                        <li>
                                            Choose your preferred funding source (Balance, Bank, or
                                            Card)
                                        </li>
                                        <li>Review the currency conversion and total amount</li>
                                        <li>Instant verification and order processing</li>
                                    </ul>
                                    <p className="text-blue-600 text-xs italic">
                                        Note: You will be redirected to PayPal's secure portal after
                                        clicking "Continue to Review" and proceeding to the final
                                        step.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="mb-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                                <img src="/paypal.png" alt="PayPal" className="h-4 w-auto" />
                                Trusted by millions worldwide
                            </p>
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-600 text-sm">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>
                        Your payment information is encrypted and secure. We never store your card
                        details.
                    </span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onPrevious}
                        className="flex-1 bg-white"
                    >
                        Previous
                    </Button>
                    <Button type="submit" className="flex-1 bg-red-700 text-white hover:bg-red-800">
                        Continue to Review
                    </Button>
                </div>
            </form>
        </div>
    )
}
