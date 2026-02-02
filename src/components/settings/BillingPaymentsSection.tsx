import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
    type PaymentMethod,
    useGetPaymentMethodPreference,
    useUpdatePaymentMethodPreference
} from "@/services/settings/usePaymentMethodPreference"
import { AlertCircle, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"

export function BillingPaymentsSection() {
    const { data, isLoading, error } = useGetPaymentMethodPreference()
    const { mutate: updatePreference, isPending } = useUpdatePaymentMethodPreference()
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)

    // Update local state when data loads
    useEffect(() => {
        if (data?.paymentMethodPreference) {
            setSelectedMethod(data.paymentMethodPreference)
        }
    }, [data])

    const handleSelectMethod = (method: PaymentMethod) => {
        setSelectedMethod(method)
        // Auto-save when selecting
        updatePreference(method)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <EmptyState
                icon={AlertCircle}
                title="Error Loading Payment Methods"
                description="Failed to load your payment method preferences. Please try again later."
            />
        )
    }

    const currentMethod = data?.paymentMethodPreference || "paypal"
    const isPayPalPrimary = currentMethod === "paypal"
    const isChapaPrimary = currentMethod === "chapa"

    // Payment method display data
    const paymentMethods = [
        {
            id: "paypal" as PaymentMethod,
            name: "PayPal",
            description: "Pay securely with PayPal",
            icon: "💳",
            color: "blue",
            isPrimary: isPayPalPrimary
        },
        {
            id: "chapa" as PaymentMethod,
            name: "Chapa",
            description: "Pay with Chapa (Mobile Money, Bank Transfer)",
            icon: "💳",
            color: "green",
            isPrimary: isChapaPrimary
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-2 font-semibold text-gray-900 text-lg">Manage billing methods</h3>
                <p className="text-gray-600 text-sm">
                    Add, update, or remove your billing methods.
                </p>
            </div>

            <div className="space-y-6">
                {/* Primary Payment Method */}
                <div>
                    <h4 className="mb-1 font-semibold text-gray-900 text-sm">Primary</h4>
                    <p className="mb-4 text-gray-600 text-sm">
                        Your primary billing method is used for all recurring payments.
                    </p>

                    {paymentMethods
                        .filter((method) => method.isPrimary)
                        .map((method) => (
                            <div
                                key={method.id}
                                className="rounded-lg border border-gray-200 bg-white p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                                                method.color === "blue"
                                                    ? "bg-blue-100"
                                                    : "bg-green-100"
                                            }`}
                                        >
                                            {method.id === "paypal" ? (
                                                <img
                                                    src="/paypal.png"
                                                    alt="PayPal"
                                                    className="h-8 w-auto object-contain"
                                                />
                                            ) : (
                                                <CreditCard
                                                    className={`h-6 w-6 ${
                                                        method.color === "green"
                                                            ? "text-green-600"
                                                            : "text-blue-600"
                                                    }`}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {method.name}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                {method.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Primary method doesn't need Edit button - it's already active */}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Additional Payment Methods */}
                <div>
                    <h4 className="mb-4 font-semibold text-gray-900 text-sm">Additional</h4>

                    {paymentMethods
                        .filter((method) => !method.isPrimary)
                        .map((method) => (
                            <div
                                key={method.id}
                                className="mb-3 rounded-lg border border-gray-200 bg-white p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                                                method.color === "blue"
                                                    ? "bg-blue-100"
                                                    : "bg-green-100"
                                            }`}
                                        >
                                            {method.id === "paypal" ? (
                                                <img
                                                    src="/paypal.png"
                                                    alt="PayPal"
                                                    className="h-8 w-auto object-contain"
                                                />
                                            ) : (
                                                <CreditCard
                                                    className={`h-6 w-6 ${
                                                        method.color === "green"
                                                            ? "text-green-600"
                                                            : "text-blue-600"
                                                    }`}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {method.name}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                {method.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSelectMethod(method.id)}
                                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                                        >
                                            Set as primary
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
