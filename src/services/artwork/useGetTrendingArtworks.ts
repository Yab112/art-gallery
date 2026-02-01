import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import { Artwork } from "@/types/artwork.types";

interface TrendingArtworksResponse {
  success: boolean;
  artworks: Artwork[];
}

export const useGetTrendingArtworks = (limit: number = 12) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<TrendingArtworksResponse>({
    queryKey: ["trending-artworks", limit],
    queryFn: async () => {
      try {
        const baseURL = axiosAuth.defaults.baseURL || '';
        const url = baseURL.endsWith('/') 
          ? `artworks/trending?limit=${limit}`
          : `/artworks/trending?limit=${limit}`;
        
        // Debug logging (development only)
        if (import.meta.env.DEV) {
          const fullUrl = `${baseURL}${url}`;
          console.log("Fetching trending artworks from:", fullUrl);
        }

        const response = await axiosAuth.get<TrendingArtworksResponse>(url);

        // Debug logging (development only)
        if (import.meta.env.DEV) {
          console.log("Trending artworks response:", response.data);
          console.log("Response status:", response.status);
        }

        if (!response.data || !response.data.artworks) {
          if (import.meta.env.DEV) {
            console.warn("Invalid response format:", response.data);
          }
          return { success: false, artworks: [] };
        }

        return response.data;
      } catch (error: any) {
        console.error("Error fetching trending artworks:", error);
        
        // Detailed error logging (development only)
        if (import.meta.env.DEV) {
          console.error("Error details:", {
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            url: error?.config?.url,
            baseURL: error?.config?.baseURL,
          });
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 2, // Retry failed requests
  });
};

