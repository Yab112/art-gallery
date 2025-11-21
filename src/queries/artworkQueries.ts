import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { artworkKeys } from "./queryKeys";
import type { Artwork, ArtworkListResponse, ArtworkQueryParams } from "@/types/artwork.types";
import useAxiosAuth from "@/hooks/use-axios-auth";

// Query Hooks
export const useArtworks = (params?: ArtworkQueryParams) => {
  const queryString = params ? new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString() : "";
  
  const axiosAuth = useAxiosAuth();
  
  return useQuery<ArtworkListResponse>({
    queryKey: artworkKeys.list(params),
    queryFn: async () => {
      const response = await axiosAuth.get<{
        artworks: any[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(`artworks${queryString ? `?${queryString}` : ""}`);
      
      // Transform backend response to match ArtworkListResponse format
      const data = response.data;
      if (data.pagination) {
        return {
          success: true,
          artworks: data.artworks || [],
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          pages: data.pagination.pages,
        };
      }
      
      // Fallback if pagination is not present (shouldn't happen, but just in case)
      return {
        success: true,
        artworks: data.artworks || [],
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: data.artworks?.length || 0,
        pages: 1,
      };
    },
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useArtwork = (id: string) => {
  return useFetchData<{ success: boolean; artwork: Artwork }>(
    artworkKeys.detail(id),
    `artworks/${id}`,
    {
      enabled: !!id,
    }
  );
};

export const useMyArtworks = (page: number = 1, limit: number = 10) => {
  return useFetchData<ArtworkListResponse>(
    artworkKeys.myArtworksList(page, limit),
    `artworks/my-artworks?page=${page}&limit=${limit}`
  );
};
