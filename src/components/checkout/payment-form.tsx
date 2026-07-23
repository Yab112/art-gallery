import { Button } from "@/components/ui/button"
import { useCheckout } from "@/contexts/CheckoutContext"
import { groupCartItemsBySeller } from "@/lib/checkout-sellers"
import { useCartItems } from "@/queries/cartQueries"
import {
    type CheckoutPaymentMethod,
    useAvailableCheckoutMethods,
} from "@/services/checkout/useAvailableCheckoutMethods"
import { useMyProfile } from "@/queries/userQueries"
import { motion } from "framer-motion"
import { ArrowRight, Lock, MapPin, Plane } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"

interface PaymentFormProps {
    onNext: () => void
}

const SETTINGS_BILLING_PATH =
    "/settings?tab=billing-payments&from=checkout"

const METHOD_COPY = {
    chapa: {
        id: "chapa" as const,
        title: "Chapa",
        currency: "ETB",
        subtitle: "Pay in Ethiopian Birr (USD total converted at checkout)",
        icon: MapPin,
        ring: "ring-emerald-700/40",
        accent: "from-emerald-800/90 to-stone-900",
    },
    paypal: {
        id: "paypal" as const,
        title: "PayPal",
        currency: "USD",
        subtitle: "Pay in US Dollars",
        icon: Plane,
        ring: "ring-red-700/35",
        accent: "from-slate-800 to-stone-900",
    },
}

function SellerPaymentSection({
    sellerId,
    sellerName,
    artworkIds,
    country,
}: {
    sellerId: string
    sellerName: string
    artworkIds: string[]
    country?: string | null
}) {
    const {
        sellerCheckouts,
        setSellerPaymentMethod,
        ensureSellerCheckout,
    } = useCheckout()

    const { data: resolved, isLoading, isError, isFetching } =
        useAvailableCheckoutMethods(artworkIds, country)

    useEffect(() => {
        ensureSellerCheckout(sellerId)
    }, [sellerId, ensureSellerCheckout])

    const available = resolved?.availableMethods || []
    const selected = sellerCheckouts[sellerId]?.paymentMethod || null

    useEffect(() => {
        if (!available.length) {
            if (selected) setSellerPaymentMethod(sellerId, null)
            return
        }
        if (selected && available.includes(selected)) return
        setSellerPaymentMethod(sellerId, available[0])
    }, [available.join(","), selected, sellerId, setSellerPaymentMethod])

    const sellerMethodsForListing = useMemo(() => {
        if (!resolved) return [] as CheckoutPaymentMethod[]
        // Listing is always USD; any connected seller payout rail can apply
        return (resolved.sellerCapabilities || []) as CheckoutPaymentMethod[]
    }, [resolved])

    const incompatibleCopy = useMemo(() => {
        const methods = sellerMethodsForListing
        if (methods.length === 0) {
            return {
                body: "This seller has no payout method connected yet.",
                cta: "Go to Billing & Payments",
            }
        }
        if (methods.length === 1) {
            const name = methods[0] === "paypal" ? "PayPal" : "Chapa"
            return {
                body: `This seller accepts ${name}. They need ${name} connected to receive payment.`,
                cta: "Go to Billing & Payments",
            }
        }
        return {
            body: "This seller accepts PayPal or Chapa, but none match your available payment methods for this checkout.",
            cta: "Go to Billing & Payments",
        }
    }, [sellerMethodsForListing])

    const showLoading = (isLoading || isFetching) && !resolved
    const showIncompatible = Boolean(resolved && !resolved.compatible)
    const showHardError = isError && !resolved

    return (
        <section className="border border-stone-200/90 bg-white/70 p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
                <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
                        Seller
                    </p>
                    <h3 className="mt-1 font-lexend text-lg font-semibold text-stone-900">
                        {sellerName}
                    </h3>
                </div>
                {resolved?.listingCurrency && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-red-800">
                        {resolved.listingCurrency}
                    </span>
                )}
            </div>

            {showLoading && (
                <p className="mt-4 text-sm text-stone-500">Resolving methods…</p>
            )}
            {showHardError && (
                <p className="mt-4 text-sm text-red-700">
                    Payment methods unavailable. Refresh and try again.
                </p>
            )}
            {showIncompatible && (
                <div className="mt-4 border border-amber-200 bg-amber-50/80 px-3 py-3 text-sm text-amber-950">
                    <p className="font-lexend font-semibold">
                        No matching payment method
                    </p>
                    <p className="mt-1 text-amber-900/90">{incompatibleCopy.body}</p>
                    <Button
                        asChild
                        size="sm"
                        className="mt-3 rounded-sm bg-stone-900 text-white hover:bg-stone-800"
                    >
                        <Link to={SETTINGS_BILLING_PATH}>
                            {incompatibleCopy.cta}
                        </Link>
                    </Button>
                </div>
            )}

            {available.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {available.map((id) => {
                        const method = METHOD_COPY[id]
                        const isSelected = selected === method.id
                        const Icon = method.icon
                        return (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() =>
                                    setSellerPaymentMethod(sellerId, method.id)
                                }
                                className={`relative overflow-hidden rounded-md border px-3 py-4 text-left transition ${
                                    isSelected
                                        ? `border-stone-900 bg-stone-950 text-white ring-2 ${method.ring}`
                                        : "border-stone-200 bg-white text-stone-900 hover:border-stone-400"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-lexend text-base font-semibold">
                                            {method.title}
                                        </p>
                                        <p
                                            className={`mt-0.5 text-xs ${
                                                isSelected
                                                    ? "text-stone-300"
                                                    : "text-stone-500"
                                            }`}
                                        >
                                            {method.subtitle}
                                        </p>
                                    </div>
                                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export function PaymentForm({ onNext }: PaymentFormProps) {
    const { shippingData, selectedCartItemIds, sellerCheckouts } = useCheckout()
    const { data: cartData } = useCartItems(1, 50)
    const { data: profileResponse } = useMyProfile()

    const buyerCountry =
        shippingData?.country ||
        profileResponse?.profile?.addressCountry ||
        null

    const sellerGroups = useMemo(() => {
        const items = (cartData?.items || []).filter((i) =>
            selectedCartItemIds.has(i.id),
        )
        return groupCartItemsBySeller(items)
    }, [cartData?.items, selectedCartItemIds])

    const allReady =
        sellerGroups.length > 0 &&
        sellerGroups.every((g) => {
            const method = sellerCheckouts[g.sellerId]?.paymentMethod
            return Boolean(method)
        })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!allReady) return
        onNext()
    }

    return (
        <div className="font-poppins">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-800/80">
                    Step 1 · How you pay
                </p>
                <h2 className="mt-2 font-lexend text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                    Choose your path
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
                    Each seller is paid separately. Pick a payment method for every
                    seller below — USD listings; Chapa charges ETB via a locked quote.
                </p>
            </motion.div>

            {sellerGroups.length === 0 ? (
                <p className="mt-8 text-sm text-stone-500">
                    Select items in your bag to continue.
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    {sellerGroups.map((g) => (
                        <SellerPaymentSection
                            key={g.sellerId}
                            sellerId={g.sellerId}
                            sellerName={g.sellerName}
                            artworkIds={g.artworkIds}
                            country={buyerCountry}
                        />
                    ))}

                    <div className="flex flex-col gap-4 border-t border-stone-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-xs text-stone-500">
                            <Lock className="h-3.5 w-3.5 text-stone-400" />
                            Encrypted checkout · we never store card details
                        </p>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!allReady}
                            className="group h-9 rounded-sm bg-red-700 px-4 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
                        >
                            Continue to shipping
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
