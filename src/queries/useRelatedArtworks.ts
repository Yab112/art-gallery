import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/use-axios-auth";
import type { Artwork } from "@/types/artwork.types";

interface RelatedArtworksResponse {
  artworks: Artwork[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useRelatedArtworks = (artworkId: string, artist?: string, categoryIds?: string[], limit = 8) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<Artwork[]>({
    queryKey: ["related-artworks", artworkId, artist, categoryIds],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", limit.toString());
      params.append("status", "APPROVED");
      
      if (artist) {
        params.append("artist", artist);
      }
      
      if (categoryIds && categoryIds.length > 0) {
        categoryIds.forEach(id => params.append("categoryIds", id));
      }

      const response = await axiosAuth.get<RelatedArtworksResponse>(`artworks?${params.toString()}`);
      
      // Filter out the current artwork
      return response.data.artworks.filter(artwork => artwork.id !== artworkId);
    },
    enabled: !!artworkId && (!!artist || (categoryIds && categoryIds.length > 0)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

