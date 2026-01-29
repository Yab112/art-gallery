import { useFetchData } from "@/hooks/use-query";
import { favoriteKeys } from "./queryKeys";
import type { FavoriteListResponse, FavoriteCheckResponse, FavoriteCountResponse } from "@/types/favorite.types";
import { useAuth } from "@/hooks/use-auth";

// Query Hooks
export const useFavorites = (page: number = 1, limit: number = 10) => {
  return useFetchData<FavoriteListResponse>(
    favoriteKeys.list(page, limit),
    `favorites?page=${page}&limit=${limit}`
  );
};

/** Skip when logged out — favorites check requires auth. Prevents 401 → login redirect for guests on shared artwork links. */
export const useCheckFavorite = (artworkId: string) => {
  const { user } = useAuth();
  return useFetchData<FavoriteCheckResponse>(
    favoriteKeys.check(artworkId),
    `favorites/check/${artworkId}`,
    {
      enabled: !!artworkId && !!user,
    }
  );
};

export const useFavoritesCount = () => {
  return useFetchData<FavoriteCountResponse>(favoriteKeys.count(), "favorites/count");
};
