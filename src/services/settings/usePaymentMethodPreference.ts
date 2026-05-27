import { api } from "@/hooks/use-axios-auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type PaymentMethod = "paypal" | "chapa"

export interface PaymentMethodPreference {
    method: PaymentMethod
    paypalEmail?: string
    chapaAccountName?: string
    chapaAccountNumber?: string
    chapaBankCode?: string
}

const fetchPaymentMethodPreference = async (): Promise<PaymentMethodPreference> => {
    const response = await api.get("/profile/payment-method-preference")
    return response.data.data
}

const updatePaymentMethodPreference = async (
    data: PaymentMethodPreference
): Promise<PaymentMethodPreference> => {
    const response = await api.put("/profile/payment-method-preference", {
        paymentMethodPreference: data.method,
        paypalEmail: data.paypalEmail,
        chapaAccountName: data.chapaAccountName,
        chapaAccountNumber: data.chapaAccountNumber,
        chapaBankCode: data.chapaBankCode
    })
    return response.data.data
}

export const useGetPaymentMethodPreference = () => {
    return useQuery({
        queryKey: ["payment-method-preference"],
        queryFn: fetchPaymentMethodPreference,
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}

export const useUpdatePaymentMethodPreference = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updatePaymentMethodPreference,
        onSuccess: (data) => {
            queryClient.setQueryData(["payment-method-preference"], data)
            toast.success("Payment method updated successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update payment method")
            // Revert on error by invalidating
            queryClient.invalidateQueries({ queryKey: ["payment-method-preference"] })
        }
    })
}

export interface ChapaBank {
    id: string;
    name: string;
    code: string;
}

export const useGetChapaBanks = () => {
    return useQuery({
        queryKey: ["chapa-banks"],
        queryFn: async (): Promise<ChapaBank[]> => {
            const response = await api.get("/payment/chapa/banks")
            return response.data.data || []
        },
        staleTime: 24 * 60 * 60 * 1000 // 24 hours
    })
}