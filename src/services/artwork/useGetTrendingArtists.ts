import useAxiosAuth from "@/hooks/use-axios-auth"
import { useQuery } from "@tanstack/react-query"

export interface TrendingArtist {
    userId: string
    name: string
    avatar: string
    artworkCount: number
    totalViews: number
    totalLikes: number
    totalComments: number
    totalFavorites: number
    totalSales: number
    salesCount: number
    totalEarnings: number
}

interface TrendingArtistsResponse {
    success: boolean
    artists: TrendingArtist[]
}

export const useGetTrendingArtists = (limit = 10) => {
    const axiosAuth = useAxiosAuth()

    return useQuery<TrendingArtistsResponse>({
        queryKey: ["trending-artists", limit],
        queryFn: async () => {
            try {
                // Ensure proper URL construction - baseURL should end with / and path should not start with /
                const baseURL = axiosAuth.defaults.baseURL || ""
                const url = baseURL.endsWith("/")
                    ? `artist/trending?limit=${limit}`
                    : `/artist/trending?limit=${limit}`

                // Debug logging (development only)
                if (import.meta.env.DEV) {
                    const fullUrl = `${baseURL}${url}`
                    console.log("Fetching trending artists from:", fullUrl)
                    console.log("Base URL:", baseURL)
                    console.log("URL path:", url)
                }

                const response = await axiosAuth.get<TrendingArtistsResponse>(url)

                // Debug logging (development only)
                if (import.meta.env.DEV) {
                    console.log("Trending artists response:", response.data)
                    console.log("Response status:", response.status)
                }

                if (!response.data || !response.data.artists) {
                    if (import.meta.env.DEV) {
                        console.warn("Invalid response format:", response.data)
                    }
                    return { success: false, artists: [] }
                }

                return response.data
            } catch (error: any) {
                console.error("Error fetching trending artists:", error)

                // Detailed error logging (development only)
                if (import.meta.env.DEV) {
                    console.error("Error details:", {
                        message: error?.message,
                        response: error?.response?.data,
                        status: error?.response?.status,
                        url: error?.config?.url,
                        baseURL: error?.config?.baseURL
                    })
                }
                throw error
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
        retry: 2 // Retry failed requests
    })
}
