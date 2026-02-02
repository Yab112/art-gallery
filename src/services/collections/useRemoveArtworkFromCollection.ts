import useMutationFunc from "@/hooks/use-mutation"
import { collectionKeys } from "@/queries/queryKeys"
import { toast } from "sonner"

interface RemoveArtworkResponse {
    success: boolean
    message: string
}

export const useRemoveArtworkFromCollection = () => {
    const { mutateAsync, isPending } = useMutationFunc<RemoveArtworkResponse, never>({
        onSuccess: () => {
            toast.success("Artwork removed from collection successfully")
        },
        onError: (error) => {
            toast.error(
                `Failed to remove artwork: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: collectionKeys.lists()
    })

    const removeArtwork = async (collectionId: string, artworkId: string) => {
        return mutateAsync({
            url: `/collections/${collectionId}/artworks/${artworkId}`,
            method: "DELETE"
        })
    }

    return {
        removeArtwork,
        isRemoving: isPending
    }
}
