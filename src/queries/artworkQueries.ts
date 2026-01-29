import { useQuery, keepPreviousData, UseQueryOptions } from "@tanstack/react-query";
import { artworkKeys } from "./queryKeys";
import type {
  Artwork,
  ArtworkListResponse,
  ArtworkQueryParams,
} from "@/types/artwork.types";
import useAxiosAuth from "@/hooks/use-axios-auth";
import { useFetchData } from "@/hooks/use-query";

// Query Hooks
export const useArtworks = (params?: ArtworkQueryParams, options?: Partial<UseQueryOptions<ArtworkListResponse>>) => {
  const queryString = params
    ? (() => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // For arrays, add each item as a separate query param (NestJS will parse as array)
            value.forEach((item) => {
              searchParams.append(key, String(item));
            });
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      return searchParams.toString();
    })()
    : "";

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
    refetchInterval: false, // Disable auto-refetch to prevent flickering
    staleTime: 10 * 60 * 1000, // Increase stale time to 10 minutes
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    ...options,
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

/**
 * Get artworks similar to a specific artwork
 * Finds artworks that share categories with the given artwork
 */
export const useSimilarArtworks = (artworkId: string, limit: number = 12) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<{ success: boolean; artworks: Artwork[] }>({
    queryKey: [...artworkKeys.detail(artworkId), "similar", limit],
    queryFn: async () => {
      const response = await axiosAuth.get<{ success: boolean; artworks: Artwork[] }>(
        `artworks/${artworkId}/similar-artworks?limit=${limit}`
      );
      return response.data;
    },
    enabled: !!artworkId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};