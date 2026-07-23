import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrderSummary } from "@/components/checkout/order-summary"
import { PaymentForm } from "@/components/checkout/payment-form"
import { ShippingInfo } from "@/components/checkout/shipping-info"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckoutProvider, useCheckout } from "@/contexts/CheckoutContext"
import { useCartItems } from "@/queries/cartQueries"
import { usePrepareCheckout } from "@/services/checkout/usePrepareCheckout"
import { formatMoney } from "@/lib/format-money"
import {
    groupCartItemsBySeller,
    saveCheckoutSession,
} from "@/lib/checkout-sellers"
import { findIncompatibleSellerPayments } from "@/lib/checkout-payment-compat"
import { startPaymentForPreparedOrder } from "@/lib/start-seller-payment"
import { ArrowLeft, ClipboardCheck, CreditCard, Truck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

function CheckoutContent() {
    const queryClient = useQueryClient()
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    useEffect(() => {
        void queryClient.invalidateQueries({
            queryKey: ["checkout-available-methods"],
        })
    }, [queryClient])

    const { shippingData, selectedCartItemIds, sellerCheckouts, setSellerPaymentMethod } =
        useCheckout()
    const { data: cartData } = useCartItems(1, 50)
    const { mutateAsync: prepareCheckout } = usePrepareCheckout()

    const selectedItems = useMemo(
        () =>
            (cartData?.items || []).filter((item) =>
                selectedCartItemIds.has(item.id),
            ),
        [cartData?.items, selectedCartItemIds],
    )

    const sellerGroups = useMemo(
        () => groupCartItemsBySeller(selectedItems),
        [selectedItems],
    )

    // Keep method resolve in sync when shipping country is set/changed
    useEffect(() => {
        if (!shippingData?.country) return
        void queryClient.invalidateQueries({
            queryKey: ["checkout-available-methods"],
        })
    }, [shippingData?.country, queryClient])

    const steps = [
        { id: 1, name: "Payment", icon: CreditCard },
        { id: 2, name: "Shipping", icon: Truck },
        { id: 3, name: "Review", icon: ClipboardCheck },
    ]

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1)
    }

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const handlePaymentMethodsInvalid = () => {
        setCurrentStep(1)
    }

    const handlePlaceOrder = async () => {
        if (!agreedToTerms) {
            toast.error("Please agree to the Terms of Service and Privacy Policy")
            return
        }

        if (!shippingData) {
            setError("Please complete all checkout steps")
            toast.error("Please complete all checkout steps")
            return
        }

        if (selectedItems.length === 0) {
            setError("Please select at least one item to checkout")
            toast.error("Please select at least one item to checkout")
            return
        }

        if (sellerGroups.length === 0) {
            setError("Could not group items by seller")
            toast.error("Could not group items by seller")
            return
        }

        for (const group of sellerGroups) {
            const state = sellerCheckouts[group.sellerId]
            if (!state?.paymentMethod) {
                setError(`Select a payment method for ${group.sellerName}`)
                toast.error(`Select a payment method for ${group.sellerName}`)
                return
            }
            if (!state?.shippingOption?.serviceType) {
                setError(`Select shipping for ${group.sellerName}`)
                toast.error(`Select shipping for ${group.sellerName}`)
                return
            }
        }

        setIsProcessing(true)
        setError(null)

        try {
            // Final guard: shipping country may have changed since payment was chosen
            const issues = await findIncompatibleSellerPayments({
                sellerGroups,
                paymentBySeller: sellerCheckouts,
                country: shippingData.country || "US",
            })
            if (issues.length > 0) {
                for (const issue of issues) {
                    setSellerPaymentMethod(issue.sellerId, null)
                }
                void queryClient.invalidateQueries({
                    queryKey: ["checkout-available-methods"],
                })
                const names = issues.map((i) => i.sellerName).join(", ")
                setCurrentStep(1)
                throw new Error(
                    `Payment method no longer available for ${names} with this shipping country. Please choose again.`,
                )
            }

            if (
                !shippingData.email ||
                !shippingData.firstName ||
                !shippingData.lastName
            ) {
                throw new Error("Please complete all required shipping information")
            }
            if (
                !shippingData.address ||
                !shippingData.city ||
                !shippingData.state ||
                !shippingData.zipCode ||
                !shippingData.phone?.trim()
            ) {
                throw new Error(
                    "Please complete all required address fields including phone number",
                )
            }

            const shippingAddressObj = {
                fullName: `${shippingData.firstName.trim()} ${shippingData.lastName.trim()}`,
                phone: shippingData.phone.trim(),
                address: `${shippingData.address.trim()}${
                    shippingData.apartment
                        ? `, ${shippingData.apartment.trim()}`
                        : ""
                }`,
                city: shippingData.city.trim(),
                state: shippingData.state.trim(),
                zipCode: String(shippingData.zipCode).trim(),
                country: (shippingData.country || "US").trim(),
            }

            const groups = sellerGroups.map((group) => {
                const state = sellerCheckouts[group.sellerId]!
                const paymentMethod = state.paymentMethod!
                const shippingOption = state.shippingOption!
                const currency =
                    paymentMethod === "chapa" ? ("ETB" as const) : ("USD" as const)

                const items = group.items.map((item) => {
                    const price = Number(item.artwork?.desiredPrice)
                    if (!item.artworkId || !price || price <= 0) {
                        throw new Error(`Invalid item for ${group.sellerName}`)
                    }
                    return {
                        artworkId: item.artworkId,
                        quantity: item.quantity,
                        price,
                    }
                })

                const transitDays =
                    typeof shippingOption.transitDays === "number" &&
                    Number.isFinite(shippingOption.transitDays)
                        ? shippingOption.transitDays
                        : undefined

                return {
                    sellerId: group.sellerId,
                    items,
                    paymentMethod,
                    currency,
                    shippingOption: {
                        serviceType: shippingOption.serviceType,
                        serviceName: shippingOption.serviceName,
                        totalCharge: shippingOption.totalCharge,
                        currency: "USD",
                        ...(transitDays != null ? { transitDays } : {}),
                    },
                }
            })

            const prepared = await prepareCheckout({
                buyerEmail: shippingData.email.trim(),
                shippingAddress: shippingAddressObj,
                groups,
            })

            if (!prepared?.success || !prepared.data?.orders?.length) {
                throw new Error("Failed to prepare checkout")
            }

            const { checkoutId, orders } = prepared.data
            saveCheckoutSession({
                checkoutId,
                orders,
                email: shippingData.email.trim(),
                firstName: shippingData.firstName?.trim(),
                lastName: shippingData.lastName?.trim(),
            })

            const first = orders[0]
            toast.message(
                orders.length > 1
                    ? `Paying seller 1 of ${orders.length}`
                    : "Redirecting to payment",
            )
            await startPaymentForPreparedOrder({
                order: first,
                email: shippingData.email.trim(),
                firstName: shippingData.firstName?.trim(),
                lastName: shippingData.lastName?.trim(),
            })
        } catch (error: any) {
            console.error("Order placement failed:", error)
            const msg =
                error?.code === "QUOTE_EXPIRED"
                    ? error.message
                    : error?.response?.data?.message ||
                      error?.message ||
                      "Failed to process order. Please try again."
            setError(msg)
            toast.error(msg)
            setIsProcessing(false)
        }
    }

    return (
        <ProtectedRoute>
            <div className="relative min-h-screen overflow-hidden bg-[#f6f3ef] font-poppins text-stone-900">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(185,28,28,0.08),_transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(68,64,60,0.08),_transparent_50%)]"
                />

                <div className="relative border-b border-stone-200/70 bg-white/50 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
                        <Link
                            to="/buyart"
                            className="inline-flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-red-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Continue shopping</span>
                        </Link>
                        <p className="hidden font-lexend text-sm font-semibold tracking-tight text-red-800 sm:block">
                            Checkout
                        </p>
                    </div>
                </div>

                <div className="relative border-b border-stone-200/70 bg-white/40 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 py-5">
                        <ol className="mx-auto flex max-w-xl items-center justify-between">
                            {steps.map((step, index) => {
                                const Icon = step.icon
                                const isActive = currentStep === step.id
                                const isCompleted = currentStep > step.id
                                return (
                                    <li
                                        key={step.id}
                                        className="flex flex-1 items-center last:flex-none"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={`flex h-9 w-9 items-center justify-center border text-xs transition-all duration-300 ${
                                                    isActive
                                                        ? "border-red-800 bg-red-800 text-white"
                                                        : isCompleted
                                                          ? "border-stone-900 bg-stone-900 text-white"
                                                          : "border-stone-300 bg-white/80 text-stone-400"
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="hidden sm:block">
                                                <span
                                                    className={`block font-lexend text-xs font-semibold tracking-wide ${
                                                        isActive
                                                            ? "text-stone-900"
                                                            : isCompleted
                                                              ? "text-stone-700"
                                                              : "text-stone-400"
                                                    }`}
                                                >
                                                    {step.name}
                                                </span>
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div
                                                className={`mx-3 h-px flex-1 transition-colors duration-300 sm:mx-5 ${
                                                    isCompleted
                                                        ? "bg-stone-800"
                                                        : "bg-stone-300"
                                                }`}
                                            />
                                        )}
                                    </li>
                                )
                            })}
                        </ol>
                    </div>
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-10">
                    <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
                        <div className="lg:order-2 lg:col-span-2">
                            <div className="lg:sticky lg:top-6">
                                <OrderSummary />
                            </div>
                        </div>

                        <div className="lg:order-1 lg:col-span-3">
                            <div className="border border-stone-200/80 bg-white/75 p-5 shadow-[0_24px_60px_-40px_rgba(28,25,23,0.45)] backdrop-blur-sm sm:p-8">
                                {currentStep === 1 && (
                                    <PaymentForm onNext={handleNext} />
                                )}

                                {currentStep === 2 && (
                                    <ShippingInfo
                                        onNext={handleNext}
                                        onPrevious={handlePrevious}
                                        onPaymentMethodsInvalid={
                                            handlePaymentMethodsInvalid
                                        }
                                    />
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-8 font-poppins">
                                        <div>
                                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-800/80">
                                                Step 3 · Confirm
                                            </p>
                                            <h2 className="mt-2 font-lexend text-3xl font-semibold tracking-tight text-stone-900">
                                                Review your orders
                                            </h2>
                                            <p className="mt-2 max-w-lg text-sm text-stone-600">
                                                {sellerGroups.length > 1
                                                    ? `You'll complete ${sellerGroups.length} separate payments — one per seller.`
                                                    : "One last look before payment."}
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="border border-red-200 bg-red-50 px-4 py-3">
                                                <p className="text-sm text-red-700">
                                                    {error}
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {sellerGroups.map((group) => {
                                                const state =
                                                    sellerCheckouts[group.sellerId]
                                                const subtotal = group.items.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        (Number(
                                                            item.artwork?.desiredPrice,
                                                        ) || 0) *
                                                            item.quantity,
                                                    0,
                                                )
                                                const shipping =
                                                    Number(
                                                        state?.shippingOption
                                                            ?.totalCharge,
                                                    ) || 0
                                                return (
                                                    <div
                                                        key={group.sellerId}
                                                        className="border border-stone-200 px-4 py-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <h3 className="font-lexend text-sm font-semibold text-stone-900">
                                                                    {group.sellerName}
                                                                </h3>
                                                                <p className="mt-1 text-sm text-stone-600">
                                                                    {state?.paymentMethod ===
                                                                    "chapa"
                                                                        ? "Chapa (ETB at locked rate)"
                                                                        : state?.paymentMethod ===
                                                                            "paypal"
                                                                          ? "PayPal"
                                                                          : "No payment"}{" "}
                                                                    ·{" "}
                                                                    {state?.shippingOption
                                                                        ?.serviceName ||
                                                                        "No shipping"}
                                                                </p>
                                                                <p className="mt-1 text-xs text-stone-500">
                                                                    {group.items.length}{" "}
                                                                    item
                                                                    {group.items.length ===
                                                                    1
                                                                        ? ""
                                                                        : "s"}
                                                                </p>
                                                            </div>
                                                            <p className="font-lexend text-sm font-semibold tabular-nums">
                                                                {formatMoney(
                                                                    subtotal + shipping,
                                                                    "USD",
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="border-t border-stone-200 pt-4">
                                            <h3 className="font-lexend text-sm font-semibold text-stone-900">
                                                Ship to
                                            </h3>
                                            {shippingData && (
                                                <p className="mt-1 text-sm text-stone-600">
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
                                                </p>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCurrentStep(2)}
                                                className="mt-2 text-red-800 hover:bg-red-50"
                                            >
                                                Edit shipping
                                            </Button>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="terms"
                                                checked={agreedToTerms}
                                                onCheckedChange={(c) =>
                                                    setAgreedToTerms(c === true)
                                                }
                                            />
                                            <Label
                                                htmlFor="terms"
                                                className="text-sm leading-relaxed text-stone-600"
                                            >
                                                I agree to the Terms of Service and
                                                Privacy Policy
                                            </Label>
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                            <Button
                                                variant="ghost"
                                                onClick={handlePrevious}
                                                disabled={isProcessing}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                onClick={handlePlaceOrder}
                                                disabled={isProcessing || !agreedToTerms}
                                                className="bg-red-700 text-white hover:bg-red-800"
                                            >
                                                {isProcessing
                                                    ? "Preparing…"
                                                    : sellerGroups.length > 1
                                                      ? `Pay ${sellerGroups.length} sellers`
                                                      : "Place order"}
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

export default function Checkout() {
    return (
        <CheckoutProvider>
            <CheckoutContent />
        </CheckoutProvider>
    )
}
