import { useFetchData } from "@/hooks/use-query"
import type { CartListResponse, CartSummary } from "@/types/cart.types"
import { cartKeys } from "./queryKeys"

export type UseCartItemsOptions = {
    enabled?: boolean
    staleTime?: number
    refetchOnMount?: boolean
    refetchOnWindowFocus?: boolean
}

/** Pass `enabled: !!user` on public pages (e.g. artwork detail) so guests don't trigger auth-only cart API → 401 → login redirect. */
export const useCartItems = (page = 1, limit = 10, options?: UseCartItemsOptions) => {
    return useFetchData<CartListResponse>(
        cartKeys.list(page, limit),
        `cart?page=${page}&limit=${limit}`,
        {
            staleTime: options?.staleTime ?? 0,
            refetchOnMount: options?.refetchOnMount ?? true,
            refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
            enabled: options?.enabled ?? true
        }
    )
}

export type UseCartSummaryOptions = {
    enabled?: boolean
}

/** Pass `enabled: !!user` in Header so guests don't trigger auth-only cart API. */
export const useCartSummary = (options?: UseCartSummaryOptions) => {
    return useFetchData<CartSummary>(cartKeys.summary(), "cart/summary", {
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: options?.enabled ?? true
    })
}
