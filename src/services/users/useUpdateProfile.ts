import useMutationFunc from "@/hooks/use-mutation"
import { userKeys } from "@/queries/queryKeys"
import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

interface UpdateProfileResponse {
    success: boolean
    profile: any
}

export interface UpdateProfileDto {
    name?: string
    avatar?: string // S3 URL
    bio?: string
    location?: string
    website?: string
    phone?: string
    coverImage?: string // S3 URL
    
    // Shipping Address
    addressLine1?: string
    addressLine2?: string
    addressCity?: string
    addressState?: string
    addressZipCode?: string
    addressCountry?: string
    addressPhone?: string
}

interface BackendErrorResponse {
    statusCode?: number
    message?: string
    data?: string[] // Array of error messages
    timestamp?: string
    path?: string
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient()

    const { mutateAsync, isPending } = useMutationFunc<UpdateProfileResponse, UpdateProfileDto>({
        onSuccess: (data) => {
            // Instantly merge returned profile into cache so Settings/Ship address UI updates now.
            if (data?.profile) {
                queryClient.setQueryData(userKeys.me(), (old: any) => {
                    if (!old || typeof old !== "object") {
                        return { success: true, profile: data.profile }
                    }
                    return {
                        ...old,
                        profile: {
                            ...(old.profile || {}),
                            ...data.profile,
                        },
                    }
                })
            }
            // Buyer country drives Chapa eligibility — refresh checkout resolve
            void queryClient.invalidateQueries({
                queryKey: ["checkout-available-methods"],
            })
            toast.success("Profile updated successfully")
        },
        onError: (error: any) => {
            // Extract error messages from backend response
            let errorMessage = "An unexpected error occurred"

            if (error instanceof AxiosError) {
                const backendError = error.response?.data as BackendErrorResponse

                // Check if error has a data array with validation messages
                if (
                    backendError?.data &&
                    Array.isArray(backendError.data) &&
                    backendError.data.length > 0
                ) {
                    // Join all validation error messages
                    errorMessage = backendError.data.join(", ")
                } else if (backendError?.message) {
                    errorMessage = backendError.message
                } else if (error.message) {
                    errorMessage = error.message
                }
            } else if (error?.data && Array.isArray(error.data) && error.data.length > 0) {
                // Handle case where error is already transformed
                errorMessage = error.data.join(", ")
            } else if (error?.message) {
                errorMessage = error.message
            }

            toast.error(`Failed to update profile: ${errorMessage}`)
        },
        queryKey: userKeys.me()
    })

    const updateProfile = async (data: UpdateProfileDto) => {
        return mutateAsync({
            url: "/profile",
            method: "PUT",
            body: data
        })
    }

    return {
        updateProfile,
        isUpdating: isPending
    }
}
