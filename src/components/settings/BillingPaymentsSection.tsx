import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
    type PaymentMethod,
    useGetPaymentMethodPreference,
    useUpdatePaymentMethodPreference
} from "@/services/settings/usePaymentMethodPreference"
import { AlertCircle, CreditCard } from "lucide-react"

export function BillingPaymentsSection() {
    const { data, isLoading, error } = useGetPaymentMethodPreference()
    const { mutate: updatePreference, variables: pendingMethod } = useUpdatePaymentMethodPreference()

    const handleSelectMethod = (method: PaymentMethod) => {
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

    const currentMethod = pendingMethod || data?.paymentMethodPreference || "paypal"
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

            <div className="space-y-4">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => !method.isPrimary && handleSelectMethod(method.id)}
                        className={`group relative rounded-lg border p-4 transition-all ${method.isPrimary
                            ? "border-red-200 bg-red-50/30 ring-1 ring-red-100"
                            : "cursor-pointer border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${method.color === "blue" ? "bg-blue-100" : "bg-green-100"
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
                                            className={`h-6 w-6 ${method.color === "green"
                                                ? "text-green-600"
                                                : "text-blue-600"
                                                }`}
                                        />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{method.name}</p>
                                        {method.isPrimary && (
                                            <span className="rounded-full bg-red-600 px-2.5 py-0.5 font-bold text-white text-[10px] uppercase tracking-wider shadow-sm">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm">{method.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end gap-1">
                                    <div
                                        className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${method.isPrimary ? "bg-red-600" : "bg-gray-200"
                                            }`}
                                    >
                                        <div
                                            className={`absolute top-1 h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${method.isPrimary ? "translate-x-6" : "translate-x-1"
                                                }`}
                                        />
                                    </div>
                                    {pendingMethod === method.id && (
                                        <span className="animate-pulse text-gray-400 text-[10px]">
                                            Updating...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
