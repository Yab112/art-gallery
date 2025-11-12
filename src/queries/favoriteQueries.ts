import { useFetchData } from "@/hooks/use-query";
import { favoriteKeys } from "./queryKeys";
import type { FavoriteListResponse, FavoriteCheckResponse, FavoriteCountResponse } from "@/types/favorite.types";

// Query Hooks
export const useFavorites = (page: number = 1, limit: number = 10) => {
  return useFetchData<FavoriteListResponse>(
    favoriteKeys.list(page, limit),
    `favorites?page=${page}&limit=${limit}`
  );
};

export const useCheckFavorite = (artworkId: string) => {
  return useFetchData<FavoriteCheckResponse>(
    favoriteKeys.check(artworkId),
    `favorites/check/${artworkId}`,
    {
      enabled: !!artworkId,
    }
  );
};

export const useFavoritesCount = () => {
  return useFetchData<FavoriteCountResponse>(favoriteKeys.count(), "favorites/count");
};
