import useAxiosAuth from "@/hooks/use-axios-auth"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { Artist } from "./useGetAllArtists"

interface GetAllArtistsPageResponse {
    success: boolean
    artists: Artist[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export const useGetAllArtistsInfinite = (limit = 12) => {
    const axiosAuth = useAxiosAuth()

    return useInfiniteQuery<GetAllArtistsPageResponse>({
        queryKey: ["all-artists-infinite", limit],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams({
                page: String(pageParam),
                limit: limit.toString(),
            })
            const response = await axiosAuth.get<GetAllArtistsPageResponse>(
                `artist/all?${params.toString()}`,
            )
            return (
                response.data ?? {
                    success: false,
                    artists: [],
                    pagination: { page: 1, limit, total: 0, pages: 0 },
                }
            )
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, pages } = lastPage.pagination ?? {}
            if (page && pages && page < pages) {
                return page + 1
            }
            return undefined
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    })
}
