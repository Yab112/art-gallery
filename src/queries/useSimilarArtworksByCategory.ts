import useAxiosAuth from "@/hooks/use-axios-auth"
import type { Artwork } from "@/types/artwork.types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

interface SimilarArtworksByCategoryResponse {
    success: boolean
    artworks: Artwork[]
    message?: string
}

export interface SimilarArtworksPage {
    artworks: Artwork[]
    page: number
    totalAvailable: number
    requestedLimit: number
}

const PAGE_SIZE = 12

export const useSimilarArtworksByCategory = (artworkId: string, limit = 12, page = 1) => {
    const axiosAuth = useAxiosAuth()

    return useQuery<Artwork[]>({
        queryKey: ["similar-artworks-by-category", artworkId, limit, page],
        queryFn: async () => {
            const fetchLimit = limit * 3
            const response = await axiosAuth.get<SimilarArtworksByCategoryResponse>(
                `artworks/${artworkId}/similar-artworks-by-category?limit=${fetchLimit}`,
            )

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch similar artworks")
            }

            return response.data.artworks
        },
        enabled: !!artworkId,
        staleTime: 5 * 60 * 1000,
    })
}

export const useSimilarArtworksByCategoryInfinite = (artworkId: string) => {
    const axiosAuth = useAxiosAuth()

    return useInfiniteQuery<SimilarArtworksPage>({
        queryKey: ["similar-artworks-by-category", artworkId, "infinite"],
        queryFn: async ({ pageParam = 1 }) => {
            const page = Number(pageParam)
            const requestedLimit = PAGE_SIZE * page

            const response = await axiosAuth.get<SimilarArtworksByCategoryResponse>(
                `artworks/${artworkId}/similar-artworks-by-category?limit=${requestedLimit}`,
            )

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch similar artworks")
            }

            const allArtworks = response.data.artworks ?? []
            const start = PAGE_SIZE * (page - 1)
            const pageArtworks = allArtworks.slice(start, start + PAGE_SIZE)

            return {
                artworks: pageArtworks,
                page,
                totalAvailable: allArtworks.length,
                requestedLimit,
            }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.artworks.length < PAGE_SIZE) return undefined
            if (lastPage.totalAvailable < lastPage.requestedLimit) return undefined
            return lastPage.page + 1
        },
        enabled: !!artworkId,
        staleTime: 5 * 60 * 1000,
    })
}
