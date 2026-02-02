import { getApiBaseUrl } from "@/lib/api-config"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

export interface RequestWithdrawalParams {
    amount: number
    iban: string
}

export interface RequestWithdrawalResponse {
    success: boolean
    message: string
    data: {
        id: string
        amount: number
        status: string
        createdAt: string
    }
}

const requestWithdrawal = async (
    params: RequestWithdrawalParams
): Promise<RequestWithdrawalResponse> => {
    const response = await axios.post(`${getApiBaseUrl()}/api/artist/withdrawal/request`, params, {
        headers: {
            "Content-Type": "application/json"
        },
        withCredentials: true
    })
    return response.data
}

export const useRequestWithdrawal = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: requestWithdrawal,
        onSuccess: () => {
            // Invalidate and refetch artist data
            queryClient.invalidateQueries({ queryKey: ["artist-earnings"] })
            queryClient.invalidateQueries({ queryKey: ["earnings"] }) // Also invalidate EarningsDashboard query
            queryClient.invalidateQueries({ queryKey: ["artist-withdrawals"] })
            // Transactions will be invalidated when withdrawal is completed (via polling)
        },
        onError: (error: any) => {
            console.error("Withdrawal request failed:", error)
        }
    })
}
