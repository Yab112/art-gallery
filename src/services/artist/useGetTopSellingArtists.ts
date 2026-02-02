import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"

export interface TopSellingArtist {
    id: string
    name: string
    avatar: string
    artworks: number
    sales: number
    views: number
    salesCount: number
    country: string
}

interface TopSellingArtistsResponse {
    success: boolean
    artists: TopSellingArtist[]
}

export const useGetTopSellingArtists = (limit = 10) => {
    const axiosAuth = useAxiosAuth()

    return useQuery<TopSellingArtistsResponse>({
        queryKey: ["top-selling-artists", limit],
        queryFn: async () => {
            try {
                const url = `artist/top-selling?limit=${limit}`
                const response = await axiosAuth.get<TopSellingArtistsResponse>(url)
                return response.data
            } catch (error: any) {
                console.error("Error fetching top selling artists:", error)
                throw error
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    })
}
