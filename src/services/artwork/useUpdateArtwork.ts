import useMutationFunc from "@/hooks/use-mutation"
import { artworkKeys } from "@/queries/queryKeys"
import type { CreateArtworkDto } from "@/types/artwork.types"
import { toast } from "sonner"

interface UpdateArtworkResponse {
    success: boolean
    artwork: any
}

export const useUpdateArtwork = () => {
    const { mutateAsync, isPending } = useMutationFunc<
        UpdateArtworkResponse,
        Partial<CreateArtworkDto>
    >({
        onSuccess: () => {
            toast.success("Artwork updated successfully")
        },
        onError: (error) => {
            toast.error(
                `Failed to update artwork: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: artworkKeys.lists()
    })

    const updateArtwork = async (id: string, data: Partial<CreateArtworkDto>) => {
        return mutateAsync({
            url: `/artworks/${id}`,
            method: "PATCH",
            body: data
        })
    }

    return {
        updateArtwork,
        isUpdating: isPending
    }
}
