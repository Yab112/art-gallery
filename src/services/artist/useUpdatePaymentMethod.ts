import { getApiBaseUrl } from "@/lib/api-config"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

export interface UpdatePaymentMethodParams {
    accountHolder: string
    iban: string
    bicCode?: string
}

export interface UpdatePaymentMethodResponse {
    success: boolean
    message: string
    data: {
        artworksUpdated: number
    }
}

const updatePaymentMethod = async (
    params: UpdatePaymentMethodParams
): Promise<UpdatePaymentMethodResponse> => {
    const response = await axios.put(`${getApiBaseUrl()}/api/artist/payment-method`, params, {
        headers: {
            "Content-Type": "application/json"
        },
        withCredentials: true
    })
    return response.data
}

export const useUpdatePaymentMethod = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updatePaymentMethod,
        onSuccess: () => {
            // Invalidate and refetch payment methods
            queryClient.invalidateQueries({ queryKey: ["artist-payment-methods"] })
        },
        onError: (error: any) => {
            console.error("Payment method update failed:", error)
        }
    })
}
