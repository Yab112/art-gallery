import useMutationFunc from "@/hooks/use-mutation"
import { collectionKeys } from "@/queries/queryKeys"
import { toast } from "sonner"

interface AddArtworkResponse {
    success: boolean
    message: string
}

export const useAddArtworkToCollection = () => {
    const { mutateAsync, isPending } = useMutationFunc<AddArtworkResponse, { artworkId: string }>({
        onSuccess: () => {
            toast.success("Artwork added to collection successfully")
        },
        onError: (error) => {
            toast.error(
                `Failed to add artwork: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: collectionKeys.lists()
    })

    const addArtwork = async (collectionId: string, artworkId: string) => {
        return mutateAsync({
            url: `/collections/${collectionId}/artworks`,
            method: "POST",
            body: { artworkId }
        })
    }

    return {
        addArtwork,
        isAdding: isPending
    }
}
