import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrderSummary } from "@/components/checkout/order-summary"
import { PaymentForm } from "@/components/checkout/payment-form"
import { ShippingInfo } from "@/components/checkout/shipping-info"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckoutProvider, useCheckout } from "@/contexts/CheckoutContext"
import { useCartItems } from "@/queries/cartQueries"
import { useCreateOrder } from "@/services/order/useCreateOrder"
import { useInitializePayment } from "@/services/payment/useInitializePayment"
import { ArrowLeft, ClipboardCheck, CreditCard, Truck } from "lucide-react"
import { useState } from "react"
// import { StripeProvider } from "@/components/checkout/stripe-provider";
import { Link } from "react-router-dom"
import { toast } from "sonner"

function CheckoutContent() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    const { shippingData, paymentData, selectedCartItemIds } = useCheckout()
    const { data: cartData } = useCartItems(1, 50)
    const { mutateAsync: createOrder } = useCreateOrder()
    const { mutateAsync: initializePayment } = useInitializePayment()

    // Force refresh to clear cache

    const steps = [
        { id: 1, name: "Shipping", icon: Truck },
        { id: 2, name: "Payment", icon: CreditCard },
        { id: 3, name: "Review", icon: ClipboardCheck }
    ]

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handlePlaceOrder = async () => {
        if (!agreedToTerms) {
            toast.error("Please agree to the Terms of Service and Privacy Policy")
            return
        }

        if (!shippingData || !paymentData) {
            setError("Please complete all checkout steps")
            toast.error("Please complete all checkout steps")
            return
        }

        // Get selected items only
        const selectedItems =
            cartData?.items?.filter((item) => selectedCartItemIds.has(item.id)) || []

        if (!cartData?.items || cartData.items.length === 0) {
            setError("Your cart is empty")
            toast.error("Your cart is empty")
            return
        }

        if (selectedItems.length === 0) {
            setError("Please select at least one item to checkout")
            toast.error("Please select at least one item to checkout")
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            // Prepare order items from SELECTED items only
            const orderItems = selectedItems.map((item) => {
                const price = Number(item.artwork?.desiredPrice)
                if (!item.artwork?.desiredPrice || isNaN(price) || price <= 0) {
                    throw new Error(
                        `Invalid or missing price for artwork "${item.artwork?.title || item.artworkId}". Please remove this item from your cart and try again.`
                    )
                }
                if (!item.artworkId) {
                    throw new Error(
                        `Missing artwork ID for item "${item.artwork?.title || "Unknown"}"`
                    )
                }
                if (!item.quantity || item.quantity <= 0) {
                    throw new Error(
                        `Invalid quantity for artwork "${item.artwork?.title || item.artworkId}"`
                    )
                }
                return {
                    artworkId: item.artworkId,
                    quantity: item.quantity,
                    price: price // Include price from artwork (must be a number)
                }
            })

            // Validate shipping data
            if (!shippingData.email || !shippingData.firstName || !shippingData.lastName) {
                throw new Error("Please complete all required shipping information")
            }
            if (
                !shippingData.address ||
                !shippingData.city ||
                !shippingData.state ||
                !shippingData.zipCode
            ) {
                throw new Error("Please complete all required address fields")
            }

            // Create shipping address object (not string)
            const shippingAddressObj = {
                fullName: `${shippingData.firstName.trim()} ${shippingData.lastName.trim()}`,
                phone: shippingData.phone?.trim() || "",
                address: `${shippingData.address.trim()}${shippingData.apartment ? `, ${shippingData.apartment.trim()}` : ""}`,
                city: shippingData.city.trim(),
                state: shippingData.state.trim(),
                zipCode: String(shippingData.zipCode).trim(), // Ensure it's a string
                country: (shippingData.country || "US").trim()
            }

            // Validate payment method
            const validPaymentMethods = ["chapa", "paypal", "card"]
            if (!paymentData.provider || !validPaymentMethods.includes(paymentData.provider)) {
                throw new Error("Please select a valid payment method")
            }

            // Step 1: Create order
            const orderResponse = await createOrder({
                buyerEmail: shippingData.email.trim(),
                shippingAddress: shippingAddressObj,
                paymentMethod: paymentData.provider as "chapa" | "paypal" | "card",
                items: orderItems
            })

            if (!orderResponse.success) {
                throw new Error(orderResponse.message || "Failed to create order")
            }

            const { txRef, totalAmount } = orderResponse.data

            // Determine currency based on payment provider
            const currency = paymentData.provider === "chapa" ? "ETB" : "USD"

            // Step 2: Initialize payment
            // Ensure provider is lowercase and amount is a number
            const provider = (paymentData.provider || "chapa").toLowerCase() as "chapa" | "paypal"
            const amount =
                typeof totalAmount === "string"
                    ? Number.parseFloat(totalAmount)
                    : Number(totalAmount)

            if (isNaN(amount) || amount <= 0) {
                throw new Error(`Invalid payment amount: ${totalAmount}`)
            }

            const paymentResponse = await initializePayment({
                provider,
                amount,
                currency,
                email: shippingData.email.trim(),
                firstName: shippingData.firstName?.trim(),
                lastName: shippingData.lastName?.trim(),
                phoneNumber: (paymentData.phoneNumber || shippingData.phone)?.trim(),
                txRef: txRef.trim(),
                orderId: orderResponse.data.orderId
            })

            console.log("Payment initialization response:", paymentResponse)

            // Payment hook's onSuccess should redirect automatically, but if it doesn't, do it here
            if (paymentResponse.success && paymentResponse.data?.checkoutUrl) {
                console.log("Redirecting to checkout URL:", paymentResponse.data.checkoutUrl)
                window.location.href = paymentResponse.data.checkoutUrl
                return // Exit early since we're redirecting
            }

            if (!paymentResponse.success) {
                throw new Error(paymentResponse.message || "Failed to initialize payment")
            }
        } catch (error: any) {
            console.error("Order placement failed:", error)
            setError(error?.message || "Failed to process order. Please try again.")
            toast.error(error?.message || "Failed to process order. Please try again.")
            setIsProcessing(false)
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="border-b bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-4">
                        <div className="flex items-center">
                            <Link
                                to="/buyart"
                                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 text-sm sm:text-base"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Continue Shopping</span>
                            </Link>

                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="border-b bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-6">
                        <div className="mx-auto w-full max-w-2xl">
                            <div className="flex w-full items-center justify-between">
                                {steps.map((step, index) => {
                                    const Icon = step.icon
                                    const isActive = currentStep === step.id
                                    const isCompleted = currentStep > step.id

                                    return (
                                        <div key={step.id} className="flex flex-1 items-center last:flex-none">
                                            <div className="flex items-center">
                                                <div
                                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10 ${isActive
                                                        ? "border-gray-500 bg-gray-500 text-white"
                                                        : isCompleted
                                                            ? "border-green-500 bg-green-500 text-white"
                                                            : "border-gray-200 bg-white text-gray-300"
                                                        }`}
                                                >
                                                    <Icon className="h-4 w-4 sm:h-5 w-5" />
                                                </div>
                                                <div className="ml-2 hidden sm:block md:ml-3">
                                                    <p
                                                        className={`font-medium text-xs sm:text-sm ${isActive
                                                            ? "text-gray-700"
                                                            : isCompleted
                                                                ? "text-green-600"
                                                                : "text-gray-400"
                                                            }`}
                                                    >
                                                        {step.name}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div
                                                    className={`mx-2 h-0.5 flex-1 sm:mx-4 md:mx-8 ${isCompleted ? "bg-green-500" : "bg-gray-200"
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Order Summary - Top on Mobile, Right on Desktop */}
                        <div className="lg:order-2 lg:col-span-1">
                            <div className="lg:sticky lg:top-6">
                                <OrderSummary />
                            </div>
                        </div>

                        {/* Checkout Form - Bottom on Mobile, Left on Desktop */}
                        <div className="lg:order-1 lg:col-span-2">
                            <div className="rounded-lg border bg-white p-4 sm:p-6">
                                {currentStep === 1 && <ShippingInfo onNext={handleNext} />}

                                {currentStep === 2 && (
                                    <PaymentForm onNext={handleNext} onPrevious={handlePrevious} />
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="mb-2 font-bold text-2xl text-gray-900">
                                                Review Your Order
                                            </h2>
                                            <p className="text-gray-600">
                                                Please review your order details before placing it.
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                                <p className="text-red-600 text-sm">{error}</p>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between border-b py-4">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        Shipping Address
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">
                                                        {shippingData ? (
                                                            <>
                                                                {shippingData.firstName}{" "}
                                                                {shippingData.lastName}
                                                                <br />
                                                                {shippingData.address}
                                                                {shippingData.apartment &&
                                                                    `, ${shippingData.apartment}`}
                                                                <br />
                                                                {shippingData.city},{" "}
                                                                {shippingData.state}{" "}
                                                                {shippingData.zipCode}
                                                                <br />
                                                                {shippingData.country}
                                                            </>
                                                        ) : (
                                                            <span className="text-red-600">
                                                                No shipping information provided
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentStep(1)}
                                                >
                                                    Edit
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between border-b py-4">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        Payment Method
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">
                                                        {paymentData ? (
                                                            paymentData.provider === "chapa" ? (
                                                                <>
                                                                    Chapa (Mobile Money, Bank
                                                                    Transfer)
                                                                </>
                                                            ) : paymentData.provider ===
                                                                "paypal" ? (
                                                                <>PayPal</>
                                                            ) : (
                                                                <>Credit/Debit Card</>
                                                            )
                                                        ) : (
                                                            <span className="text-red-600">
                                                                No payment method selected
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentStep(2)}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="terms"
                                                checked={agreedToTerms}
                                                onCheckedChange={(checked) =>
                                                    setAgreedToTerms(checked as boolean)
                                                }
                                            />
                                            <Label
                                                htmlFor="terms"
                                                className="cursor-pointer text-gray-600 text-sm"
                                            >
                                                I agree to the{" "}
                                                <a
                                                    href="#"
                                                    className="text-red-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Terms of Service
                                                </a>{" "}
                                                and{" "}
                                                <a
                                                    href="#"
                                                    className="text-red-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
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
                                                disabled={isProcessing || !agreedToTerms}
                                                className="flex-1 bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                                            >
                                                {isProcessing ? "Processing..." : "Place Order"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default function CheckoutPage() {
    return (
        <CheckoutProvider>
            <CheckoutContent />
        </CheckoutProvider>
    )
}
