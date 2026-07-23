import type { CartItem } from "@/types/cart.types"
import type { ShippingOption } from "@/contexts/CheckoutContext"
import type { CheckoutPaymentMethod } from "@/services/checkout/useAvailableCheckoutMethods"

export interface SellerCheckoutGroup {
    sellerId: string
    sellerName: string
    cartItemIds: string[]
    artworkIds: string[]
    items: CartItem[]
}

export interface SellerCheckoutState {
    paymentMethod: CheckoutPaymentMethod | null
    shippingOption: ShippingOption | null
}

export function getArtworkSellerId(artwork: any): string | null {
    if (!artwork) return null
    return (
        artwork.userId ||
        artwork.user?.id ||
        artwork.artistId ||
        null
    )
}

export function getArtworkSellerName(artwork: any): string {
    return (
        artwork?.user?.name ||
        artwork?.artist ||
        artwork?.artistName ||
        "Seller"
    )
}

/** Group selected cart items by artwork owner (seller). */
export function groupCartItemsBySeller(
    items: CartItem[],
): SellerCheckoutGroup[] {
    const map = new Map<string, SellerCheckoutGroup>()

    for (const item of items) {
        const sellerId = getArtworkSellerId(item.artwork)
        if (!sellerId) continue

        const existing = map.get(sellerId)
        if (existing) {
            existing.items.push(item)
            existing.cartItemIds.push(item.id)
            if (item.artworkId) existing.artworkIds.push(item.artworkId)
        } else {
            map.set(sellerId, {
                sellerId,
                sellerName: getArtworkSellerName(item.artwork),
                items: [item],
                cartItemIds: [item.id],
                artworkIds: item.artworkId ? [item.artworkId] : [],
            })
        }
    }

    return Array.from(map.values())
}

export const CHECKOUT_SESSION_KEY = "multi-seller-checkout"

export interface StoredCheckoutSession {
    checkoutId: string
    orders: Array<{
        orderId: string
        sellerId: string
        txRef: string
        totalAmount: number
        currency: string
        paymentProvider: string
        status: string
        chargeQuote?: {
            quoteId: string
            provider: string
            listingUsd: number
            shippingUsd: number
            feeUsd: number
            totalUsd: number
            fxRate: number | null
            fxSource: string | null
            lockedAt: string
            expiresAt: string
            chargedCurrency: string
            chargedAmount: number
        }
        totalUsd?: number
    }>
    email: string
    firstName?: string
    lastName?: string
}

export function saveCheckoutSession(session: StoredCheckoutSession) {
    sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session))
}

export function loadCheckoutSession(): StoredCheckoutSession | null {
    try {
        const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY)
        if (!raw) return null
        return JSON.parse(raw) as StoredCheckoutSession
    } catch {
        return null
    }
}

export function clearCheckoutSession() {
    sessionStorage.removeItem(CHECKOUT_SESSION_KEY)
}

export function markCheckoutOrderPaid(orderId: string) {
    const session = loadCheckoutSession()
    if (!session) return null
    session.orders = session.orders.map((o) =>
        o.orderId === orderId ? { ...o, status: "PAID" } : o,
    )
    saveCheckoutSession(session)
    return session
}

export function nextUnpaidCheckoutOrder(session: StoredCheckoutSession) {
    return session.orders.find((o) => o.status !== "PAID") || null
}
