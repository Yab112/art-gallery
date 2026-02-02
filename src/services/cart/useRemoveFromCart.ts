import useMutationFunc from "@/hooks/use-mutation"
import { cartKeys } from "@/queries/queryKeys"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface RemoveFromCartResponse {
    success: boolean
    message: string
}

export const useRemoveFromCart = () => {
    const queryClient = useQueryClient()
    const { mutateAsync, isPending } = useMutationFunc<RemoveFromCartResponse, never>({
        onSuccess: () => {
            toast.success("Removed from cart")
            // Invalidate all cart-related queries (not just exact match)
            queryClient.invalidateQueries({ queryKey: cartKeys.all })
        },
        onError: (error) => {
            toast.error(
                `Failed to remove from cart: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: cartKeys.lists()
    })

    const removeFromCart = async (artworkId: string) => {
        return mutateAsync({
            url: `/cart/${artworkId}`,
            method: "DELETE"
        })
    }

    return {
        removeFromCart,
        isRemoving: isPending
    }
}
