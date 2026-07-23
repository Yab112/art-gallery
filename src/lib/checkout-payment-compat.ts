import {
    fetchAvailableCheckoutMethods,
    type CheckoutPaymentMethod,
} from "@/services/checkout/useAvailableCheckoutMethods"
import type { SellerCheckoutGroup } from "@/lib/checkout-sellers"

export interface PaymentCompatIssue {
    sellerId: string
    sellerName: string
    selected: CheckoutPaymentMethod | null
    available: CheckoutPaymentMethod[]
}

/**
 * Re-resolve available methods for each seller group against a buyer country.
 * Returns sellers whose currently selected method is no longer allowed.
 */
export async function findIncompatibleSellerPayments(params: {
    sellerGroups: SellerCheckoutGroup[]
    paymentBySeller: Record<
        string,
        { paymentMethod: CheckoutPaymentMethod | null } | undefined
    >
    country: string
}): Promise<PaymentCompatIssue[]> {
    const country = params.country.trim()
    const issues: PaymentCompatIssue[] = []

    await Promise.all(
        params.sellerGroups.map(async (group) => {
            const selected =
                params.paymentBySeller[group.sellerId]?.paymentMethod || null
            if (!group.artworkIds.length) return

            const resolved = await fetchAvailableCheckoutMethods(
                group.artworkIds,
                country,
            )
            const available = resolved?.availableMethods || []

            if (!selected || !available.includes(selected)) {
                issues.push({
                    sellerId: group.sellerId,
                    sellerName: group.sellerName,
                    selected,
                    available,
                })
            }
        }),
    )

    return issues
}
