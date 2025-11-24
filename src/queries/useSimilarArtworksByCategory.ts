import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { Artwork } from "@/types/artwork.types";

interface SimilarArtworksByCategoryResponse {
  success: boolean;
  artworks: Artwork[];
  message?: string;
}

export const useSimilarArtworksByCategory = (artworkId: string, limit = 12) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<Artwork[]>({
    queryKey: ["similar-artworks-by-category", artworkId, limit],
    queryFn: async () => {
      const response = await axiosAuth.get<SimilarArtworksByCategoryResponse>(
        `artworks/${artworkId}/similar-artworks-by-category?limit=${limit}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch similar artworks");
      }

      return response.data.artworks;
    },
    enabled: !!artworkId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

