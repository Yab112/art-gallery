import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";

export interface SimilarArtist {
  id: string;
  name: string;
  avatar: string;
  artworks: number;
  sales: number;
  views: number;
}

interface SimilarArtistsResponse {
  success: boolean;
  artists: SimilarArtist[];
}

export const useGetSimilarArtists = (artistId: string, limit: number = 6) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<SimilarArtistsResponse>({
    queryKey: ["similar-artists", artistId, limit],
    queryFn: async () => {
      try {
        const url = `artist/similar/${artistId}?limit=${limit}`;
        const response = await axiosAuth.get<SimilarArtistsResponse>(url);
        return response.data;
      } catch (error: any) {
        console.error("Error fetching similar artists:", error);
        throw error;
      }
    },
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

