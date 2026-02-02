import useMutationFunc from "@/hooks/use-mutation"
import { artworkKeys } from "@/queries/queryKeys"
import { toast } from "sonner"

interface DeleteArtworkResponse {
    success: boolean
    message: string
}

export const useDeleteArtwork = () => {
    const { mutateAsync, isPending } = useMutationFunc<DeleteArtworkResponse, never>({
        onSuccess: () => {
            toast.success("Artwork deleted successfully")
        },
        onError: (error) => {
            toast.error(
                `Failed to delete artwork: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: artworkKeys.lists()
    })

    const deleteArtwork = async (id: string) => {
        return mutateAsync({
            url: `/artworks/${id}`,
            method: "DELETE"
        })
    }

    return {
        deleteArtwork,
        isDeleting: isPending
    }
}
