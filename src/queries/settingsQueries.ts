import { useFetchData } from "@/hooks/use-query"

interface PlatformSettings {
    platformCommissionRate: number // Percentage (0-100)
    siteName: string
}

interface PaymentSettings {
    minWithdrawalAmount: number
    minWithdrawalAmountPaypal: number
    minWithdrawalAmountChapa: number
    maxWithdrawalAmount: number
    maxWithdrawalAmountPaypal: number
    maxWithdrawalAmountChapa: number
    paymentTimeoutMinutes: number
    holdingPeriodDays: number
    platformCommissionRate: number
}

interface OrderSettings {
    orderExpirationHours: number
    autoCancelPendingOrdersDays: number
}

interface CollectionSettings {
    maxCollectionsPerUser: number
    maxArtworksPerCollection: number
    minArtworksForPublish: number
}

interface PlatformSettingsResponse {
    success: boolean
    settings: PlatformSettings
}

interface PaymentSettingsResponse {
    success: boolean
    settings: PaymentSettings
}

interface OrderSettingsResponse {
    success: boolean
    settings: OrderSettings
}

interface CollectionSettingsResponse {
    success: boolean
    settings: CollectionSettings
}

export const usePlatformSettings = () => {
    return useFetchData<PlatformSettingsResponse>(["settings", "platform"], "settings/platform", {
        staleTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false
    })
}

export const usePaymentSettings = () => {
    return useFetchData<PaymentSettingsResponse>(["settings", "payment"], "settings/payment", {
        staleTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false
    })
}

export const useOrderSettings = () => {
    return useFetchData<OrderSettingsResponse>(["settings", "order"], "settings/order", {
        staleTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false
    })
}

export const useCollectionSettings = () => {
    return useFetchData<CollectionSettingsResponse>(
        ["settings", "collection"],
        "settings/collection",
        {
            staleTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false
        }
    )
}

