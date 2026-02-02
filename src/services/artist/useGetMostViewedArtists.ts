import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"

export interface MostViewedArtist {
    id: string
    name: string
    avatar: string
    artworks: number
    sales: number
    views: number
    country: string
}

interface MostViewedArtistsResponse {
    success: boolean
    artists: MostViewedArtist[]
}

export const useGetMostViewedArtists = (limit = 10) => {
    const axiosAuth = useAxiosAuth()

    return useQuery<MostViewedArtistsResponse>({
        queryKey: ["most-viewed-artists", limit],
        queryFn: async () => {
            try {
                const url = `artist/most-viewed?limit=${limit}`
                const response = await axiosAuth.get<MostViewedArtistsResponse>(url)
                return response.data
            } catch (error: any) {
                console.error("Error fetching most viewed artists:", error)
                throw error
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    })
}
