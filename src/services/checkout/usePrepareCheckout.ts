import { api } from "@/hooks/use-axios-auth"
import { useMutation } from "@tanstack/react-query"
import type { ShippingOption } from "@/contexts/CheckoutContext"

export interface ChargeQuote {
    quoteId: string
    provider: "paypal" | "chapa"
    listingUsd: number
    shippingUsd: number
    feeUsd: number
    totalUsd: number
    fxRate: number | null
    fxSource: string | null
    lockedAt: string
    expiresAt: string
    chargedCurrency: "USD" | "ETB"
    chargedAmount: number
}

export interface PrepareCheckoutGroup {
    sellerId: string
    items: Array<{ artworkId: string; quantity: number; price: number }>
    paymentMethod: "chapa" | "paypal" | "card"
    /** Expected charge currency (USD PayPal / ETB Chapa) — server validates against quote */
    currency: "USD" | "ETB"
    shippingOption: ShippingOption
}

export interface PrepareCheckoutParams {
    buyerEmail: string
    shippingAddress: {
        fullName: string
        phone: string
        address: string
        city: string
        state: string
        zipCode: string
        country?: string
    }
    groups: PrepareCheckoutGroup[]
}

export interface PreparedOrder {
    orderId: string
    sellerId: string
    txRef: string
    totalAmount: number
    currency: string
    paymentProvider: string
    status: string
    chargeQuote?: ChargeQuote
    totalUsd?: number
}

export interface PrepareCheckoutResponse {
    success: boolean
    data: {
        checkoutId: string
        orders: PreparedOrder[]
    }
}

export function usePrepareCheckout() {
    return useMutation({
        mutationFn: async (
            params: PrepareCheckoutParams,
        ): Promise<PrepareCheckoutResponse> => {
            const res = await api.post("/checkout/prepare", params)
            return res.data
        },
    })
}
