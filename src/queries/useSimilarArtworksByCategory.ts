import useAxiosAuth from "@/hooks/use-axios-auth"
import type { Artwork } from "@/types/artwork.types"
import { useQuery } from "@tanstack/react-query"

interface SimilarArtworksByCategoryResponse {
    success: boolean
    artworks: Artwork[]
    message?: string
}

export const useSimilarArtworksByCategory = (artworkId: string, limit = 12, page = 1) => {
    const axiosAuth = useAxiosAuth()

    return useQuery<Artwork[]>({
        queryKey: ["similar-artworks-by-category", artworkId, limit, page],
        queryFn: async () => {
            // Fetch more items to support client-side pagination
            // We'll fetch all available and paginate on client side
            const fetchLimit = limit * 3 // Fetch 3 pages worth for smooth pagination
            const response = await axiosAuth.get<SimilarArtworksByCategoryResponse>(
                `artworks/${artworkId}/similar-artworks-by-category?limit=${fetchLimit}`
            )

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch similar artworks")
            }

            return response.data.artworks
        },
        enabled: !!artworkId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    })
}
