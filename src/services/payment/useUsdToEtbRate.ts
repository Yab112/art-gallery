import { getApiBaseUrl } from "@/lib/api-config"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export interface UsdToEtbRate {
    base: "USD"
    quote: "ETB"
    rate: number
    fetchedAt: string
    source: string
}

async function fetchUsdToEtb(): Promise<UsdToEtbRate> {
    // REPORTING-ONLY — must never drive checkout charges (PAYMENT_AND_PAYOUT_ARCHITECTURE.md)
    const response = await axios.get(`${getApiBaseUrl()}/api/payment/reporting/exchange-rate`, {
        params: { base: "USD", quote: "ETB" },
        withCredentials: true,
    })
    const data = response.data?.data
    const rate = Number(data?.rate)
    if (!Number.isFinite(rate) || rate <= 0) {
        throw new Error(response.data?.message || "Failed to load exchange rate")
    }
    return {
        base: "USD",
        quote: "ETB",
        rate,
        fetchedAt: data.fetchedAt || new Date().toISOString(),
        source: data.source || "unknown",
    }
}

/** Live USD→ETB for Chapa checkout preview (server-locked again at order create). */
export function useUsdToEtbRate(enabled = true) {
    return useQuery({
        queryKey: ["fx", "USD", "ETB"],
        queryFn: fetchUsdToEtb,
        enabled,
        staleTime: 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        retry: 2,
    })
}

export function usdToEtb(amountUsd: number, rate: number): number {
    return Math.round((amountUsd * rate + Number.EPSILON) * 100) / 100
}
