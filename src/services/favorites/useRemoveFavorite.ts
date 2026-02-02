import useMutationFunc from "@/hooks/use-mutation"
import { favoriteKeys } from "@/queries/queryKeys"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface RemoveFavoriteResponse {
    success: boolean
    message: string
}

export const useRemoveFavorite = () => {
    const queryClient = useQueryClient()

    const { mutateAsync, isPending } = useMutationFunc<RemoveFavoriteResponse, never>({
        onSuccess: (data, options) => {
            toast.success("Removed from favorites")
            // Extract artworkId from URL (format: /favorites/{artworkId})
            const url = options.url || ""
            const artworkId = url.split("/favorites/")[1]
            // Invalidate favorite check query to ensure it's in sync
            if (artworkId) {
                queryClient.invalidateQueries({ queryKey: favoriteKeys.check(artworkId) })
            }
            // Invalidate favorites list
            queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() })
        },
        onError: (error) => {
            toast.error(
                `Failed to remove favorite: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: favoriteKeys.lists()
    })

    const removeFavorite = async (artworkId: string) => {
        // Optimistically update before the API call for instant UI feedback
        const checkKey = favoriteKeys.check(artworkId)
        queryClient.cancelQueries({ queryKey: checkKey })
        const previousData = queryClient.getQueryData(checkKey)
        queryClient.setQueryData(checkKey, { isFavorite: false })

        try {
            const result = await mutateAsync({
                url: `/favorites/${artworkId}`,
                method: "DELETE"
            })
            return result
        } catch (error) {
            // Rollback optimistic update on error
            if (previousData !== undefined) {
                queryClient.setQueryData(checkKey, previousData)
            } else {
                // If no previous data, set to true
                queryClient.setQueryData(checkKey, { isFavorite: true })
            }
            throw error
        }
    }

    return {
        removeFavorite,
        isRemoving: isPending
    }
}
