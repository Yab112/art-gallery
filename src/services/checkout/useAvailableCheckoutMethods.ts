import { api } from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"

export type CheckoutPaymentMethod = "paypal" | "chapa"

export interface AvailableCheckoutMethods {
    availableMethods: CheckoutPaymentMethod[]
    buyerCapabilities: CheckoutPaymentMethod[]
    sellerCapabilities: CheckoutPaymentMethod[]
    listingCurrency: "USD" | "ETB"
    compatible: boolean
    reason?: string
    sellerIds?: string[]
}

export async function fetchAvailableCheckoutMethods(
    artworkIds: string[],
    country?: string | null,
): Promise<AvailableCheckoutMethods> {
    const params = new URLSearchParams({
        artworkIds: artworkIds.join(","),
    })
    if (country) params.set("country", country)
    const res = await api.get(
        `/checkout/available-methods?${params.toString()}`,
    )
    return res.data?.data as AvailableCheckoutMethods
}

export function useAvailableCheckoutMethods(
    artworkIds: string[],
    country?: string | null,
) {
    const idsKey = [...artworkIds].sort().join(",")
    return useQuery({
        queryKey: ["checkout-available-methods", idsKey, country || ""],
        enabled: artworkIds.length > 0,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        queryFn: () => fetchAvailableCheckoutMethods(artworkIds, country),
    })
}
