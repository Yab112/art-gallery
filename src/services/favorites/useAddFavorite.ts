import useMutationFunc from "@/hooks/use-mutation";
import { toast } from "sonner";
import { favoriteKeys, artworkKeys } from "@/queries/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

interface AddFavoriteResponse {
  success: boolean;
  message: string;
  favorite: any;
}

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  
  const { mutateAsync, isPending } = useMutationFunc<AddFavoriteResponse, { artworkId: string }>({
    onSuccess: (data, options) => {
      toast.success("Added to favorites");
      // Invalidate favorite check query to ensure it's in sync
      const artworkId = options.body?.artworkId;
      if (artworkId) {
        queryClient.invalidateQueries({ queryKey: favoriteKeys.check(artworkId) });
      }
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
    onError: (error) => {
      toast.error("Failed to add favorite: " + (error?.message || "An unexpected error occurred"));
    },
    queryKey: favoriteKeys.lists(),
  });

  const addFavorite = async (artworkId: string) => {
    // Optimistically update before the API call for instant UI feedback
    const checkKey = favoriteKeys.check(artworkId);
    queryClient.cancelQueries({ queryKey: checkKey });
    const previousData = queryClient.getQueryData(checkKey);
    queryClient.setQueryData(checkKey, { isFavorite: true });
    
    try {
      const result = await mutateAsync({
        url: "/favorites",
        method: "POST",
        body: { artworkId },
      });
      return result;
    } catch (error) {
      // Rollback optimistic update on error
      if (previousData !== undefined) {
        queryClient.setQueryData(checkKey, previousData);
      } else {
        // If no previous data, set to false
        queryClient.setQueryData(checkKey, { isFavorite: false });
      }
      throw error;
    }
  };

  return {
    addFavorite,
    isAdding: isPending,
  };
};

