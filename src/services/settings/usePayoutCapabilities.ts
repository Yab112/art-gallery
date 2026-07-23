import { api } from "@/hooks/use-axios-auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type PayoutProvider = "paypal" | "chapa"

export interface SellerPayoutCapability {
    id: string
    userId: string
    provider: PayoutProvider
    payoutSupport: "full" | "sendOnly" | "unsupported"
    paypalEmail?: string | null
    chapaAccountName?: string | null
    chapaAccountNumber?: string | null
    chapaBankCode?: string | null
    connectedAt?: string
    updatedAt?: string
}

export interface ConnectPayoutInput {
    provider: PayoutProvider
    paypalEmail?: string
    chapaAccountName?: string
    chapaAccountNumber?: string
    chapaBankCode?: string
}

export function usePayoutCapabilities() {
    return useQuery({
        queryKey: ["payout-capabilities"],
        queryFn: async (): Promise<SellerPayoutCapability[]> => {
            const res = await api.get("/profile/payout-capabilities")
            if (res.data?.success === false) {
                throw new Error(res.data?.message || "Failed to load payout capabilities")
            }
            return Array.isArray(res.data?.data) ? res.data.data : []
        },
        staleTime: 60_000,
    })
}

export function useConnectPayoutCapability() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (input: ConnectPayoutInput) => {
            const { provider, ...body } = input
            const res = await api.post(`/profile/payout-capabilities/${provider}`, body)
            return res.data?.data as SellerPayoutCapability
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["payout-capabilities"] })
            qc.invalidateQueries({ queryKey: ["payment-method-preference"] })
            qc.invalidateQueries({ queryKey: ["checkout-available-methods"] })
            toast.success(
                `${vars.provider === "chapa" ? "Chapa" : "PayPal"} payout connected`,
            )
        },
        // panel close is handled by parent via capability list refresh
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to connect payout method",
            )
        },
    })
}

export function useDisconnectPayoutCapability() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (provider: PayoutProvider) => {
            const res = await api.delete(`/profile/payout-capabilities/${provider}`)
            return res.data
        },
        onSuccess: (_data, provider) => {
            qc.invalidateQueries({ queryKey: ["payout-capabilities"] })
            qc.invalidateQueries({ queryKey: ["payment-method-preference"] })
            qc.invalidateQueries({ queryKey: ["checkout-available-methods"] })
            toast.success(
                `${provider === "chapa" ? "Chapa" : "PayPal"} payout disconnected`,
            )
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                    "Cannot disconnect while this rail has pending or withdrawable balance",
            )
        },
    })
}

export interface ChapaBank {
    id: string
    name: string
    /** Chapa transfer bank_code (numeric id as string). */
    code: string
    slug?: string | null
    isMobileMoney?: boolean
    accountLength?: number | null
}

export function useGetChapaBanks() {
    return useQuery({
        queryKey: ["chapa-banks"],
        queryFn: async (): Promise<ChapaBank[]> => {
            const response = await api.get("/payment/chapa/banks")
            const raw = response.data.data || []
            return (Array.isArray(raw) ? raw : [])
                .map((bank: any): ChapaBank | null => {
                    const id = bank?.id != null ? String(bank.id) : ""
                    const code =
                        bank?.code != null && String(bank.code).trim() !== ""
                            ? String(bank.code)
                            : id
                    if (!code || !bank?.name) return null
                    return {
                        id: id || code,
                        name: String(bank.name),
                        code,
                        slug: bank?.slug != null ? String(bank.slug) : null,
                        isMobileMoney: Boolean(
                            bank?.isMobileMoney === true ||
                                bank?.is_mobilemoney === 1 ||
                                bank?.is_mobilemoney === true,
                        ),
                        accountLength:
                            typeof bank?.accountLength === "number"
                                ? bank.accountLength
                                : typeof bank?.acct_length === "number"
                                  ? bank.acct_length
                                  : null,
                    }
                })
                .filter(Boolean) as ChapaBank[]
        },
        staleTime: 24 * 60 * 60 * 1000,
    })
}
