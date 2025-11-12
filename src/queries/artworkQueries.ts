import { useFetchData } from "@/hooks/use-query";
import { artworkKeys } from "./queryKeys";
import type { Artwork, ArtworkListResponse, ArtworkQueryParams } from "@/types/artwork.types";

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
  return useFetchData<ArtworkListResponse>(
    artworkKeys.list(params),
    `artwork${queryString ? `?${queryString}` : ""}`,
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    }
  );
};

export const useArtwork = (id: string) => {
  return useFetchData<{ success: boolean; artwork: Artwork }>(
    artworkKeys.detail(id),
    `artwork/${id}`,
    {
      enabled: !!id,
    }
  );
};

export const useMyArtworks = (page: number = 1, limit: number = 10) => {
  return useFetchData<ArtworkListResponse>(
    artworkKeys.myArtworksList(page, limit),
    `artwork/my-artworks?page=${page}&limit=${limit}`
  );
};
