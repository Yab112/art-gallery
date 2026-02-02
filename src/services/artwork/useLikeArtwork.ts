import useMutationFunc from "@/hooks/use-mutation"
import { artworkKeys } from "@/queries/queryKeys"
import { toast } from "sonner"

interface LikeArtworkResponse {
    success: boolean
    message: string
}

export const useLikeArtwork = () => {
    const { mutateAsync, isPending } = useMutationFunc<LikeArtworkResponse, never>({
        onSuccess: () => {
            toast.success("Artwork liked")
        },
        onError: (error) => {
            toast.error(
                `Failed to like artwork: ${error?.message || "An unexpected error occurred"}`
            )
        },
        queryKey: artworkKeys.lists()
    })

    const likeArtwork = async (id: string) => {
        const result = await mutateAsync({
            url: `/artworks/${id}/like`,
            method: "POST"
        })
        return result
    }

    return {
        likeArtwork,
        isLiking: isPending
    }
}
